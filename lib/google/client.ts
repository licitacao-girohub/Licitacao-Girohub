import 'server-only';
import { OAuth2Client, JWT } from 'google-auth-library';

// drive.file: o sistema só enxerga o que ele mesmo criou (planilha, pastas, arquivos enviados por ele).
export const ESCOPOS = ['https://www.googleapis.com/auth/drive.file'];

let cache: OAuth2Client | JWT | null = null;

/**
 * GOOGLE_AUTH_MODE=oauth (padrão): conta GiroHub autorizada uma vez via `npm run google:auth`
 *   → GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
 * GOOGLE_AUTH_MODE=service_account: conta de serviço membro de um Drive compartilhado
 *   → GOOGLE_SERVICE_ACCOUNT_B64 (JSON da chave em base64)
 */
export function googleAuth(): OAuth2Client | JWT {
  if (cache) return cache;
  const modo = process.env.GOOGLE_AUTH_MODE || 'oauth';
  if (modo === 'service_account') {
    const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_B64;
    if (!b64) throw new Error('GOOGLE_SERVICE_ACCOUNT_B64 não configurado.');
    const k = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
    cache = new JWT({ email: k.client_email, key: k.private_key, scopes: ESCOPOS });
  } else {
    const { GOOGLE_CLIENT_ID: id, GOOGLE_CLIENT_SECRET: sec, GOOGLE_REFRESH_TOKEN: rt } = process.env;
    if (!id || !sec || !rt) throw new Error('GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e GOOGLE_REFRESH_TOKEN são obrigatórios.');
    const c = new OAuth2Client({ clientId: id, clientSecret: sec });
    c.setCredentials({ refresh_token: rt });
    cache = c;
  }
  return cache;
}

export async function accessToken(): Promise<string> {
  const t = await googleAuth().getAccessToken();
  const tok = typeof t === 'string' ? t : t?.token;
  if (!tok) throw new Error('Não foi possível obter o token de acesso do Google.');
  return tok;
}
