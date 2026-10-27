// Autoriza o sistema a usar a conta Google da GiroHub (uma vez só). Uso: npm run google:auth
// Precisa de GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env.local (cliente OAuth do tipo "App para computador").
// Abre uma página do Google; entre com licitacao@girohub.com.br e aceite. O script imprime o GOOGLE_REFRESH_TOKEN.
import http from 'node:http';
import { OAuth2Client } from 'google-auth-library';
import { carregarEnv } from './_env.mjs';

carregarEnv();
const { GOOGLE_CLIENT_ID: id, GOOGLE_CLIENT_SECRET: sec } = process.env;
if (!id || !sec) { console.error('Preencha GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env.local antes.'); process.exit(1); }

const PORTA = 53682;
const redirect = `http://127.0.0.1:${PORTA}/oauth2callback`;
const cli = new OAuth2Client({ clientId: id, clientSecret: sec, redirectUri: redirect });
const url = cli.generateAuthUrl({
  access_type: 'offline', prompt: 'consent', login_hint: 'licitacao@girohub.com.br',
  scope: ['https://www.googleapis.com/auth/drive.file'],
});

const srv = http.createServer(async (req, res) => {
  if (!req.url?.startsWith('/oauth2callback')) { res.end(); return; }
  const code = new URL(req.url, redirect).searchParams.get('code');
  if (!code) { res.end('Autorização cancelada.'); srv.close(); return; }
  try {
    const { tokens } = await cli.getToken(code);
    res.end('Pronto! Pode fechar esta aba e voltar ao terminal.');
    if (!tokens.refresh_token) {
      console.error('\nO Google não devolveu refresh token. Remova o acesso do app em https://myaccount.google.com/permissions e rode de novo.');
    } else {
      console.log('\nCopie a linha abaixo para o .env.local e para a Vercel:\n');
      console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
    }
  } catch (e) {
    res.end('Falhou. Veja o terminal.');
    console.error(e);
  } finally { srv.close(); }
});
srv.listen(PORTA, '127.0.0.1', () => {
  console.log('\nAbra este endereço no navegador e entre com licitacao@girohub.com.br:\n');
  console.log(url, '\n');
});
