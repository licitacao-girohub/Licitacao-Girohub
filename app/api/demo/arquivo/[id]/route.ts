import { NextResponse } from 'next/server';
import { usuarioAtual } from '@/lib/auth';
import { modoDemo } from '@/lib/repo';
import { arquivoDemo } from '@/lib/demo/demo';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!modoDemo() || !(await usuarioAtual())) return NextResponse.json({ erro: 'Indisponível.' }, { status: 404 });
  const a = arquivoDemo((await params).id);
  if (!a) return NextResponse.json({ erro: 'Arquivo não encontrado.' }, { status: 404 });
  return new NextResponse(new Uint8Array(a.conteudo), {
    headers: { 'Content-Type': a.mime || 'application/octet-stream', 'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(a.nome)}` },
  });
}
