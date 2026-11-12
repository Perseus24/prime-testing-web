import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    const role = req.cookies.get('role')?.value;

    if (!token) return NextResponse.redirect(new URL('/', req.url));

    if (req.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL('/tests', req.url));
    }
    return NextResponse.next();
}

export const config = { matcher: ['/tests/:path*', '/admin/:path*'] };