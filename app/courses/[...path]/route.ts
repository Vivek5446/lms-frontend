import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getBackendCoursesBaseUrl() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    return null;
  }

  return backendUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
}

function buildUpstreamUrl(request: NextRequest, pathSegments: string[]) {
  const backendBaseUrl = getBackendCoursesBaseUrl();

  if (!backendBaseUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured");
  }

  const upstreamPath = pathSegments.map((segment) => encodeURIComponent(segment)).join("/");
  const upstreamUrl = new URL(`${backendBaseUrl}/courses/${upstreamPath}`);

  request.nextUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.append(key, value);
  });

  return upstreamUrl;
}

async function proxyCourseAsset(request: NextRequest, pathSegments: string[]) {
  const upstreamUrl = buildUpstreamUrl(request, pathSegments);
  const forwardedHeaderNames = [
    "sec-fetch-dest",
    "sec-fetch-mode",
    "sec-fetch-site",
    "sec-fetch-user",
    "referer",
    "origin",
    "user-agent",
  ];
  const forwardedHeaders = new Headers({
    accept: request.headers.get("accept") || "*/*",
  });

  for (const headerName of forwardedHeaderNames) {
    const headerValue = request.headers.get(headerName);
    if (headerValue) {
      forwardedHeaders.set(headerName, headerValue);
    }
  }

  if (request.headers.get("range")) {
    forwardedHeaders.set("range", request.headers.get("range") as string);
  }

  if (request.headers.get("if-none-match")) {
    forwardedHeaders.set("if-none-match", request.headers.get("if-none-match") as string);
  }

  if (request.headers.get("if-modified-since")) {
    forwardedHeaders.set("if-modified-since", request.headers.get("if-modified-since") as string);
  }

  const upstreamResponse = await fetch(upstreamUrl, {
    method: request.method,
    headers: forwardedHeaders,
    cache: "no-store",
  });

  const headers = new Headers();
  const passthroughHeaders = [
    "content-type",
    "content-length",
    "cache-control",
    "content-encoding",
    "content-range",
    "etag",
    "expires",
    "last-modified",
    "accept-ranges",
    "content-disposition",
    "vary",
  ];

  for (const headerName of passthroughHeaders) {
    const headerValue = upstreamResponse.headers.get(headerName);
    if (headerValue) {
      headers.set(headerName, headerValue);
    }
  }

  if (!headers.has("cache-control")) {
    headers.set("cache-control", "private, no-store");
  }

  return new NextResponse(request.method === "HEAD" ? null : upstreamResponse.body, {
    status: upstreamResponse.status,
    headers,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return proxyCourseAsset(request, params.path || []);
}

export async function HEAD(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return proxyCourseAsset(request, params.path || []);
}
