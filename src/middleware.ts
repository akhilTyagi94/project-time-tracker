import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Session check
    const sessionId = request.cookies.get('session_id')?.value;

    // 2. Auth Page handling
    const isAuthPage = pathname === '/login' || pathname === '/register';
    
    if (isAuthPage) {
        if (sessionId) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    // 3. Protected Route handling (everything else matched by config)
    if (!sessionId) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
