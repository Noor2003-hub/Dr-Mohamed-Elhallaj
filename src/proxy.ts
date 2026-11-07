import { NextResponse, type NextRequest } from 'next/server'

/**
 * English lives on "/", Arabic on "/ar".
 * "/" is served by the [lang] route as "en" without changing the address,
 * and "/en" redirects back to "/" so each page has one address.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/en'
    return NextResponse.rewrite(url)
  }
  if (pathname === '/en' || pathname === '/en/') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }
}

export const config = { matcher: ['/', '/en', '/en/'] }
