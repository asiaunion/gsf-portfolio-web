import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function proxy(request: NextRequest) {
  const hasAuth = request.cookies.has('auth_session')
  const isLoginPage = request.nextUrl.pathname === '/login'

  if (!hasAuth && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  if (hasAuth && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - apple-icon
     */
    '/((?!api|_next/static|_next/image|favicon.ico|apple-icon|manifest|.*\\.svg$).*)',
  ],
}
