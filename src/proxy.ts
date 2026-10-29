import { NextResponse, type NextRequest } from "next/server";
import { publicPath } from "@/features/content/data/public-paths.mjs";

export function proxy(request: NextRequest) {
  if (/^\/admin(?:\/|$)/i.test(request.nextUrl.pathname))
    return new Response("Not Found", { status: 404 });
  let decoded;
  try {
    decoded = decodeURIComponent(request.nextUrl.pathname);
  } catch {
    return NextResponse.next();
  }
  const path = publicPath(request.nextUrl.pathname);
  if (path === decoded) return NextResponse.next();
  const destination = request.nextUrl.clone();
  destination.pathname = path;
  return NextResponse.redirect(destination, 308);
}

export const config = { matcher: ["/((?!_next/|api/|images/|models/|videos/|icon.svg).*)"] };
