/**
 * One-off / cron: download Amazon product art server-side → `public/product-images/{ASIN}.jpg`,
 * update `products.image_url` to `/product-images/{ASIN}.jpg`. Download tries (in order): widget
 * redirect, `images-na` P-URLs, then PDP HTML (`og:image`, JSON hiRes, m.media-amazon.com URLs).
 * Browsers never load Amazon URLs — only these local paths + `placeholder.jpg` on failure.
 * Requires Neon `DATABASE_URL` in `.env`.
 */
import "dotenv/config";

import * as fs from "fs";
import * as path from "path";

import { amazonAsinFromProductUrl } from "../src/lib/amazon-media";
import { localProductImagePath } from "../src/lib/product-image";
import { prisma } from "../src/lib/prisma";

const PUBLIC_IMAGES = path.join(process.cwd(), "public", "product-images");
const PLACEHOLDER_REL = "/product-images/placeholder.jpg";
const PLACEHOLDER_FILE = path.join(PUBLIC_IMAGES, "placeholder.jpg");

/** Minimal valid JPEG (1×1) for placeholder. */
const PLACEHOLDER_JPEG = Buffer.from(
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=",
  "base64"
);

function assertNeonDatabaseUrl(): void {
  const url = process.env.DATABASE_URL ?? "";
  if (!url) {
    console.error("[cache-images] DATABASE_URL is not set.");
    process.exit(1);
  }
  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    console.error("[cache-images] Invalid DATABASE_URL.");
    process.exit(1);
  }
  if (!host.includes("neon")) {
    console.error(
      "[cache-images] Refusing to run: DATABASE_URL must point at Neon."
    );
    process.exit(1);
  }
}

function looksLikeImageBuffer(buf: Buffer): boolean {
  if (buf.length < 12) return false;
  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
  // PNG
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return true;
  }
  // GIF
  if (
    buf[0] === 0x47 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x38
  ) {
    return true;
  }
  // WebP RIFF
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46
  ) {
    return true;
  }
  return false;
}

/** Server-only candidate URLs (not used by the browser). */
function imageDownloadCandidates(asin: string): string[] {
  const tag = process.env.AMAZON_ASSOCIATE_TAG?.trim();
  let widget =
    `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${encodeURIComponent(asin)}` +
    `&Format=_SL500_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1`;
  if (tag) widget += `&tag=${encodeURIComponent(tag)}`;
  return [
    widget,
    `https://images-na.ssl-images-amazon.com/images/P/${encodeURIComponent(asin)}.01._SCLZZZZZZZ_.jpg`,
    `https://images-na.ssl-images-amazon.com/images/P/${encodeURIComponent(asin)}._AC_SL500_.jpg`,
  ];
}

async function fetchImageBytes(asin: string): Promise<Buffer | null> {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: "https://www.amazon.com/",
  } as const;

  for (const url of imageDownloadCandidates(asin)) {
    try {
      const res = await fetch(url, { redirect: "follow", headers });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 200) continue;
      const ct = res.headers.get("content-type") ?? "";
      if (ct.startsWith("image/") || looksLikeImageBuffer(buf)) {
        return buf;
      }
    } catch {
      /* try next */
    }
  }

  return fetchImageFromAmazonPdp(asin);
}

function collectImageUrlsFromPdpHtml(html: string): string[] {
  const out: string[] = [];
  const og =
    html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1] ??
    html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i)?.[1];
  if (og) out.push(og.replace(/&amp;/g, "&").trim());
  const hiRes = html.match(/"hiRes"\s*:\s*"([^"]+)"/);
  if (hiRes?.[1]) out.push(hiRes[1].replace(/\\u002F/g, "/"));
  const large = html.match(/"large"\s*:\s*"([^"]+)"/);
  if (large?.[1]) out.push(large[1].replace(/\\u002F/g, "/"));
  const mediaRe =
    /https:\/\/m\.media-amazon\.com\/images\/I\/[0-9A-Za-z._%-]+\.(?:jpg|png|webp)/gi;
  const media = html.match(mediaRe);
  if (media?.length) {
    const uniq = [...new Set(media)];
    uniq.sort((a, b) => b.length - a.length);
    out.push(uniq[0]!);
  }
  return [...new Set(out.filter((u) => u.startsWith("http")))];
}

/** Last resort: PDP HTML fetch(es), then embedded image URLs (not used in UI). */
async function fetchImageFromAmazonPdp(asin: string): Promise<Buffer | null> {
  const pageUrls = [
    `https://www.amazon.com/dp/${encodeURIComponent(asin)}`,
    `https://www.amazon.com/gp/aw/d/${encodeURIComponent(asin)}`,
  ];
  const htmlHeaders = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
  } as const;

  for (const pageUrl of pageUrls) {
    try {
      const res = await fetch(pageUrl, { redirect: "follow", headers: htmlHeaders });
      if (!res.ok) continue;
      const html = await res.text();
      const candidates = collectImageUrlsFromPdpHtml(html);
      for (const imageUrl of candidates) {
        try {
          const imgRes = await fetch(imageUrl, {
            redirect: "follow",
            headers: {
              ...htmlHeaders,
              Referer: pageUrl,
              Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
            },
          });
          if (!imgRes.ok) continue;
          const buf = Buffer.from(await imgRes.arrayBuffer());
          if (buf.length < 200) continue;
          if (looksLikeImageBuffer(buf)) return buf;
          const ct = imgRes.headers.get("content-type") ?? "";
          if (ct.startsWith("image/")) return buf;
        } catch {
          /* next candidate */
        }
      }
    } catch {
      /* next page URL */
    }
  }
  return null;
}

function ensurePlaceholderOnDisk(): void {
  fs.mkdirSync(PUBLIC_IMAGES, { recursive: true });
  if (!fs.existsSync(PLACEHOLDER_FILE)) {
    fs.writeFileSync(PLACEHOLDER_FILE, PLACEHOLDER_JPEG);
    console.log("[cache-images] wrote", PLACEHOLDER_REL);
  }
}

async function main(): Promise<void> {
  assertNeonDatabaseUrl();
  if (!prisma) {
    console.error("[cache-images] Prisma client is null.");
    process.exit(1);
  }

  ensurePlaceholderOnDisk();

  const products = await prisma.product.findMany({
    where: {
      published: true,
      productUrl: { contains: "amazon.com/dp/", mode: "insensitive" },
      NOT: { productUrl: { contains: "example", mode: "insensitive" } },
    },
    select: { id: true, productUrl: true, imageUrl: true },
  });

  const readCount = products.length;
  let newDownloads = 0;
  let alreadyOnDisk = 0;
  let failed = 0;
  let updatedRows = 0;
  let idx = 0;

  for (const p of products) {
    if (idx++ > 0) {
      await new Promise((r) => setTimeout(r, 450));
    }
    const asin = amazonAsinFromProductUrl(p.productUrl);
    if (!asin) {
      failed += 1;
      try {
        await prisma.product.update({
          where: { id: p.id },
          data: { imageUrl: PLACEHOLDER_REL },
        });
        updatedRows += 1;
      } catch {
        /* ignore */
      }
      continue;
    }

    const rel = localProductImagePath(asin);
    const outFile = path.join(PUBLIC_IMAGES, `${asin}.jpg`);

    if (fs.existsSync(outFile) && fs.statSync(outFile).size > 300) {
      alreadyOnDisk += 1;
      if (p.imageUrl?.trim() !== rel) {
        await prisma.product.update({
          where: { id: p.id },
          data: { imageUrl: rel },
        });
        updatedRows += 1;
      }
      continue;
    }

    const bytes = await fetchImageBytes(asin);
    if (bytes) {
      fs.mkdirSync(PUBLIC_IMAGES, { recursive: true });
      fs.writeFileSync(outFile, bytes);
      newDownloads += 1;
      await prisma.product.update({
        where: { id: p.id },
        data: { imageUrl: rel },
      });
      updatedRows += 1;
    } else {
      failed += 1;
      await prisma.product.update({
        where: { id: p.id },
        data: { imageUrl: PLACEHOLDER_REL },
      });
      updatedRows += 1;
    }
  }

  const successImages = newDownloads + alreadyOnDisk;
  console.log("[cache-images] products read:", readCount);
  console.log("[cache-images] new files downloaded:", newDownloads);
  console.log("[cache-images] already cached on disk:", alreadyOnDisk);
  console.log("[cache-images] successful images total:", successImages);
  console.log("[cache-images] failed (placeholder in DB):", failed);
  console.log("[cache-images] rows image_url updated:", updatedRows);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
