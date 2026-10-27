import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const COOKIE = 'gh_sessao';
const DURACAO_H = 12;

export interface Usuario { usuario: string; nome: string; }
interface UsuarioCfg extends Usuario { hash: string; }

function segredo(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('SESSION_SECRET ausente ou curto (mínimo 32 caracteres).');
  return new TextEncoder().encode(s);
}

/** Usuários vêm de AUTH_USERS_B64: JSON em base64 [{usuario, nome, hash}] gerado por `npm run senha`. */
function usuarios(): UsuarioCfg[] {
  const b64 = process.env.AUTH_USERS_B64;
  if (!b64) throw new Error('AUTH_USERS_B64 não configurado.');
  const lista = JSON.parse(Buffer.from(b64, 'base64').toString('utf8')) as UsuarioCfg[];
  return lista.map((u) => ({ ...u, usuario: u.usuario.trim().toLowerCase() }));
}

export async function verificarCredenciais(usuario: string, senha: string): Promise<Usuario | null> {
  const alvo = usuarios().find((u) => u.usuario === usuario.trim().toLowerCase());
  // Compara mesmo quando o usuário não existe, para não revelar quais usuários existem pelo tempo de resposta.
  const hash = alvo?.hash ?? '$2b$10$utopf6h5N6TVvYfeL.x16OtgLKr94Kkb5xBnWTeWORyZBQ9if.fKG';
  const ok = await bcrypt.compare(senha, hash);
  return ok && alvo ? { usuario: alvo.usuario, nome: alvo.nome } : null;
}

export async function criarSessao(u: Usuario) {
  const token = await new SignJWT({ nome: u.nome })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(u.usuario)
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_H}h`)
    .sign(segredo());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: DURACAO_H * 3600,
  });
}

export async function encerrarSessao() {
  (await cookies()).delete(COOKIE);
}

export async function lerToken(token: string | undefined): Promise<Usuario | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, segredo(), { algorithms: ['HS256'] });
    return { usuario: String(payload.sub), nome: String(payload.nome ?? payload.sub) };
  } catch {
    return null;
  }
}

export async function usuarioAtual(): Promise<Usuario | null> {
  return lerToken((await cookies()).get(COOKIE)?.value);
}

/** Use em páginas e server actions: a proteção não depende só do proxy. */
export async function exigirUsuario(): Promise<Usuario> {
  const u = await usuarioAtual();
  if (!u) redirect('/login');
  return u;
}
