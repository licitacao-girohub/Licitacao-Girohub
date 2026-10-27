import { NextResponse } from 'next/server';
import { usuarioAtual } from '@/lib/auth';
import { modoDemo } from '@/lib/repo';
import { registrarArquivoDemo } from '@/lib/demo/demo';

export async function PUT(req: Request) {
  if (!modoDemo()) return NextResponse.json({ erro: 'Indisponível.' }, { status: 404 });
  if (!(await usuarioAtual())) return NextResponse.json({ erro: 'Sessão expirada.' }, { status: 401 });
  const u = new URL(req.url);
  const buf = Buffer.from(await req.arrayBuffer());
  if (buf.length > 25 * 1024 * 1024) return NextResponse.json({ erro: 'Limite de 25 MB.' }, { status: 413 });
  const id = registrarArquivoDemo(u.searchParams.get('nome') ?? 'arquivo', u.searchParams.get('mime') ?? '', u.searchParams.get('pasta') ?? '', buf);
  return NextResponse.json({ id });
}
