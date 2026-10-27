// Gera AUTH_USERS_B64 (usuários e senhas do sistema). Uso: npm run senha
// Pergunta usuário, nome e senha de cada pessoa. As senhas não ficam salvas: só o hash bcrypt.
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import bcrypt from 'bcryptjs';

const rl = readline.createInterface({ input: stdin, output: stdout });
const lista = [];
console.log('\nCadastro de usuários do sistema de licitações GiroHub\n');
for (;;) {
  const usuario = (await rl.question('Usuário (ex.: ruan) — Enter vazio para terminar: ')).trim().toLowerCase();
  if (!usuario) break;
  const nome = (await rl.question('Nome exibido (ex.: Ruan): ')).trim() || usuario;
  const senha = await rl.question('Senha (mínimo 10 caracteres): ');
  if (senha.length < 10) { console.log('  Senha curta. Tente de novo.\n'); continue; }
  lista.push({ usuario, nome, hash: bcrypt.hashSync(senha, 12) });
  console.log(`  ✓ ${nome} adicionado\n`);
}
rl.close();
if (!lista.length) { console.log('Nenhum usuário cadastrado.'); process.exit(1); }
console.log('\nCopie a linha abaixo para o .env.local e para as variáveis da Vercel:\n');
console.log(`AUTH_USERS_B64=${Buffer.from(JSON.stringify(lista)).toString('base64')}\n`);
