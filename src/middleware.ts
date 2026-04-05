import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Minimal admin protection: HTTP Basic Auth via ADMIN_USERNAME + ADMIN_PASSWORD.
 * Applies to /admin/* and /api/admin/*.
 */
export function middleware(request: NextRequest) {
  const user = process.env.ADMIN_USERNAME?.trim();
  const pass = process.env.ADMIN_PASSWORD?.trim();

  if (!user || !pass) {
    return new NextResponse(
      "FlashDealAI admin is not configured: set ADMIN_USERNAME and ADMIN_PASSWORD in your environment (e.g. .env), restart the server, then sign in with HTTP Basic auth when your browser prompts.\n",
      {
        status: 401,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "WWW-Authenticate":
            'Basic realm="FlashDealAI Admin - configure ADMIN_USERNAME and ADMIN_PASSWORD"',
        },
      },
    );
  }

  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) {
    return challenge();
  }

  let decoded: string;
  try {
    decoded = atob(auth.slice(6));
  } catch {
    return challenge();
  }

  const colon = decoded.indexOf(":");
  const u = colon >= 0 ? decoded.slice(0, colon) : decoded;
  const p = colon >= 0 ? decoded.slice(colon + 1) : "";

  if (u !== user || p !== pass) {
    return challenge();
  }

  return NextResponse.next();
}

function challenge(): NextResponse {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="FlashDealAI Admin"',
    },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
