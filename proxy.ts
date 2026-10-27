import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE = 'gh_sessao';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === '/login') return NextResponse.next();

  const token = req.cookies.get(COOKIE)?.value;
  let ok = false;
  if (token && process.env.SESSION_SECRET) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.SESSION_SECRET), { algorithms: ['HS256'] });
      ok = true;
    } catch { ok = false; }
  }
  if (ok) return NextResponse.next();

  if (pathname.startsWith('/api/')) return NextResponse.json({ erro: 'Sessão expirada. Entre novamente.' }, { status: 401 });
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|brand/|icon.png|favicon.ico).*)'],
};
