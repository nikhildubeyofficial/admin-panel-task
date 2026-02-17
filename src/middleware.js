import { NextResponse } from 'next/server'

export function middleware(request) {
    // Only protect /dashboard routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        const token = request.cookies.get('token')?.value
        console.log(`Middleware: Accessing ${request.nextUrl.pathname}. Token present: ${!!token}`)

        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Note: extensive verification with 'jsonwebtoken' is not supported in Edge Middleware.
        // We rely on cookie presence here. 
        // Strict validation happens in API routes and Server Components (which run in Node.js).
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*'],
}
