import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public paths
    if (pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname === '/favicon.ico') {
        const sessionId = request.cookies.get('session_id')?.value;
        // If logged in and trying to access /login, redirect to /
        if (pathname === '/login' && sessionId) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    // Protected paths check
    const sessionId = request.cookies.get('session_id')?.value;
    if (!sessionId) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
