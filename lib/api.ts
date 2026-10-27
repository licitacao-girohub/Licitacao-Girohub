import 'server-only';
import { NextResponse } from 'next/server';
import { usuarioAtual, type Usuario } from './auth';
import { repo } from './repo';
import type { Documento } from './model';

export class ErroApi extends Error { constructor(msg: string, public status = 400) { super(msg); } }

/** Envolve rotas: exige sessão válida e devolve erros em JSON legível. */
export function rota(fn: (u: Usuario, corpo: Record<string, unknown>, req: Request) => Promise<unknown>) {
  return async (req: Request) => {
    try {
      const u = await usuarioAtual();
      if (!u) throw new ErroApi('Sessão expirada. Entre novamente.', 401);
      const corpo = req.method === 'POST' ? ((await req.json().catch(() => ({}))) as Record<string, unknown>) : {};
      return NextResponse.json((await fn(u, corpo, req)) ?? { ok: true });
    } catch (e) {
      const status = e instanceof ErroApi ? e.status : 500;
      console.error('[api]', e);
      return NextResponse.json({ erro: e instanceof Error ? e.message : 'Erro inesperado.' }, { status });
    }
  };
}

export async function documentoOuErro(id: unknown): Promise<Documento> {
  const d = typeof id === 'string' ? await repo().obter(id) : null;
  if (!d) throw new ErroApi('Documento não encontrado.', 404);
  return d;
}
