import { NextRequest, NextResponse } from "next/server";

/** Affiliate exit — validates http(s) only, then 302 to merchant. */
export function GET(req: NextRequest) {
  const u = req.nextUrl.searchParams.get("u");
  if (!u) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  let parsed: URL;
  try {
    parsed = new URL(u);
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.redirect(parsed.toString(), { status: 302 });
}
