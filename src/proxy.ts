export function proxy() {
  return new Response("Not Found", { status: 404 });
}

export const config = { matcher: ["/admin/:path*"] };
