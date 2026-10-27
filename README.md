# Licitações GiroHub · Sistema do checklist mestre (Fase 1)

> **Retomando o trabalho?** Comece por [`docs/STATUS.md`](docs/STATUS.md): o que já foi feito, o próximo passo e como montar o projeto numa máquina nova.

Sistema web para controlar os documentos de habilitação e proposta da GiroHub. Ele mostra:

- conformidade geral, por grupo e por tipo;
- alertas de vencimento a partir de 30 dias;
- arquivos guardados no Google Drive;
- geração dos Word "Produzir" do piloto CRMV-ES e do PDF de cada versão.

Os dados ficam numa planilha Google da conta **licitacao@girohub.com.br**.

| Peça | Onde fica |
|---|---|
| Telas e regras | Este projeto (Next.js 16), publicado na Vercel |
| Dados | Planilha "Checklist Mestre – Licitações GiroHub (Sistema)" |
| Arquivos | Drive, na pasta "GiroHub – Licitações" (Biblioteca 00–11 e Certames/CRMV-ES) |
| Usuários | Ruan e Olávio, com usuário e senha |
| E-mails de alerta | Script do Google (Apps Script) dentro da planilha, enviado de licitacao@girohub.com.br |

**Regra de conformidade:** documentos Validados e dentro do prazo ÷ (total − "Não se aplica"). "Modelo pronto" e "Em verificação" ainda não contam como conformes.

---

## 0. O que instalar na sua máquina

1. **Node.js 22 LTS**: baixe em https://nodejs.org (versão LTS). Para conferir, rode `node -v` no terminal; deve aparecer v22 ou maior.
2. **Git**: baixe em https://git-scm.com.
3. Um editor de código (opcional, recomendado): **VS Code**, em https://code.visualstudio.com.

Contas necessárias:

- **GitHub**, onde o código fica guardado.
- **Vercel**, onde o sistema fica no ar. Crie a conta entrando com o GitHub.
- Acesso à conta Google **licitacao@girohub.com.br**.

## 1. Ver o sistema em modo demonstração (sem Google, 5 minutos)

```bash
cd girohub-licitacoes
npm install
cp .env.example .env.local        # no Windows: copy .env.example .env.local
```

Abra o `.env.local` e preencha:

```
DATA_MODE=demo
SESSION_SECRET=   ← cole o resultado de: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
AUTH_USERS_B64=   ← cole o resultado de: npm run senha   (cadastre ruan e olavio)
```

Depois rode `npm run dev` e abra http://localhost:3000.

No modo demonstração os dados ficam na pasta `.data/`, só na sua máquina. A geração de PDF não funciona nesse modo.

## 2. Preparar o Google (uma vez, cerca de 15 minutos)

Faça tudo logado como **licitacao@girohub.com.br**.

1. Acesse https://console.cloud.google.com e crie o projeto **GiroHub Licitações**.
2. Em **APIs e serviços → Biblioteca**, ative a **Google Drive API** e a **Google Sheets API**.
3. Em **APIs e serviços → Tela de consentimento OAuth** (ou "Google Auth Platform"):
   - Se a GiroHub usa Google Workspace, escolha **Interno**. É o recomendado.
   - Se a opção "Interno" não aparecer, escolha **Externo** e depois clique em **Publicar app** (colocar em produção). O sistema só pede o escopo `drive.file`, que não exige verificação do Google. **Não deixe em "Teste"**: nesse modo, a autorização expira em 7 dias.
4. Em **Credenciais → Criar credenciais → ID do cliente OAuth**, escolha o tipo **App para computador**. Copie o ID do cliente e a chave secreta para o `.env.local`:
   ```
   GOOGLE_AUTH_MODE=oauth
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```
5. Rode `npm run google:auth`. Abra o link que aparecer, entre com licitacao@girohub.com.br e aceite. Copie o `GOOGLE_REFRESH_TOKEN` que for impresso.
6. Rode `npm run google:setup`. Ele cria a pasta "GiroHub – Licitações", as subpastas 00–11 e a planilha nova (com as linhas compostas já separadas), e envia os 9 Word do piloto. Ao final, copie `SHEET_ID` e `DRIVE_ROOT_ID` para o `.env.local`.
7. Troque `DATA_MODE=demo` por `DATA_MODE=google`, rode `npm run dev` e teste: anexe um arquivo, gere um PDF e confira se aparecem na planilha e no Drive.

> **Alternativa sem OAuth:** se preferir uma conta de serviço, use `GOOGLE_AUTH_MODE=service_account` com `GOOGLE_SERVICE_ACCOUNT_B64` e `DRIVE_PARENT_ID` apontando para uma pasta dentro de um **Drive compartilhado** (conta de serviço não tem espaço próprio no Drive).

> O sistema só enxerga o que ele mesmo criou no Drive (escopo `drive.file`). Não mova as pastas para fora de "GiroHub – Licitações" e não renomeie as abas nem as colunas da planilha.

## 3. Publicar no GitHub

1. No GitHub, crie um repositório **privado** chamado `girohub-licitacoes`.
2. Na pasta do projeto, rode:

```bash
git init
git add .
git commit -m "Sistema do checklist mestre - Fase 1"
git branch -M main
git remote add origin https://github.com/<conta-da-girohub>/girohub-licitacoes.git
git push -u origin main
```

O `.env.local` não vai para o GitHub: ele está no `.gitignore`.

## 4. Publicar na Vercel

Depois que a Vercel estiver conectada ao Claude, eu faço o deploy. Para fazer manualmente:

1. Em https://vercel.com, clique em **Add New → Project** e importe `girohub-licitacoes`.
2. Em **Environment Variables**, cadastre: `DATA_MODE=google`, `SESSION_SECRET`, `AUTH_USERS_B64`, `GOOGLE_AUTH_MODE`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `SHEET_ID` e `DRIVE_ROOT_ID`.
3. Clique em **Deploy**. O endereço fica parecido com `girohub-licitacoes.vercel.app`.

## 5. Alertas por e-mail

Os avisos vão para licitacao@girohub.com.br em **30, 15, 7 e 1 dia antes do vencimento e no dia**, com um resumo toda segunda-feira. Quem envia é um **script do Google (Apps Script) dentro da própria planilha**, rodando na conta licitacao@. Ele não depende do sistema estar no ar nem dos conectores do Claude.

Instale logo depois do `npm run google:setup`, seguindo [`docs/apps-script/COMO-INSTALAR.md`](docs/apps-script/COMO-INSTALAR.md). Leva cerca de 5 minutos: colar o script, rodar `instalar` e depois `testarEnvio`. Cada aviso enviado fica registrado na aba "Alertas_enviados", o que evita repetição.

## Uso no dia a dia

- **Olávio:** abre o documento, clica em **Anexar arquivo** e preenche a **data de emissão** e a **validade em dias**. Confere e marca **Validado**. O sistema não deixa validar sem arquivo.
- **Atalho de emissão:** cada documento tem um botão para o site oficial. Os atalhos iniciais são só os que temos certeza. Na primeira emissão, salve o link correto no campo "Atalho de emissão".
- **Word → PDF:** em itens "Produzir", clique em **Gerar Word (piloto CRMV-ES)**. Ajuste o arquivo no Drive e clique em **Gerar PDF desta versão**.
- **Excluir:** o arquivo vai para a lixeira do Drive e pode ser recuperado por 30 dias. Arquivos substituídos continuam no Drive.
- **Histórico:** tudo o que é feito pelo sistema fica registrado na tela Histórico e na aba "Historico".

## Trocar senha ou incluir usuário

Rode `npm run senha` de novo, troque `AUTH_USERS_B64` na Vercel e faça um novo deploy.

## Estrutura do código

```
app/                telas (Painel, Documentos, Detalhe, Histórico, Login) e rotas /api
components/         tabela, formulários, painel de arquivo, chips e medidores
lib/model.ts        regras: vencimento, alertas, conformidade
lib/google/         planilha (Sheets) e Drive
lib/demo/           modo demonstração
lib/templates/      geradores dos 9 Word do piloto CRMV-ES (identidade GiroHub)
docs/apps-script/   script de alertas por e-mail (instalar na planilha)
docs/STATUS.md      onde o projeto está e o próximo passo
data/seed.json      checklist inicial (gerado de data/origem_checklist_v0.1.json)
scripts/            senha, google:auth, google:setup
```

## Fase 2 (próxima)

Módulo de licitações:

- Kanban das 7 etapas;
- checklist por certame e cruzamento do vencimento com a data da sessão;
- Go/No-Go e análise de edital;
- ZIP do pacote e registro pós-certame;
- recorrência automática e integração com o Giro Radar.
