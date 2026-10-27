# Status do projeto · Sistema do checklist mestre (Fase 1)

**Atualizado em 27/10/2026.** Leia este arquivo primeiro ao retomar o trabalho em outra máquina ou numa nova conversa com o Claude.

## Onde estamos

| Etapa | Situação |
|---|---|
| Código do sistema (Fase 1) | ✅ Pronto, no GitHub `licitacao-girohub/Licitacao-Girohub` (branch `main`) |
| Modo demonstração na máquina do Ruan | ✅ Rodou em 27/10/2026: login, painel e 35 documentos |
| Pacote "Produzir" do piloto CRMV-ES (9 Word) | ✅ Gerado em 16/10/2026; o sistema gera de novo pelo botão "Gerar Word" |
| Google Cloud (conta **licitacao@girohub.com.br**) | ⏳ **Próxima etapa:** README, seção 2 |
| `npm run google:auth` e `npm run google:setup` | ⏳ Depois do Google Cloud |
| Deploy na Vercel | ⏳ Falta conectar a Vercel ao Claude ou fazer pelo painel (README, seção 4) |
| Alertas por e-mail | ✅ Script pronto (`docs/apps-script/Alertas.gs`), testado fora do Google · ⏳ instalar na planilha logo depois do `google:setup` ([guia](apps-script/COMO-INSTALAR.md)) |
| Fase 2 (módulo de licitações, análise de edital etc.) | ⏳ Depois da Fase 1 no ar |

Decisões já tomadas:

- **Conta da operação:** licitacao@girohub.com.br (Google e GitHub).
- **Dados:** planilha nova no Google Sheets, criada pelo `npm run google:setup` a partir da planilha v0.1.
- **Arquivos:** Google Drive.
- **Usuários:** ruan e olavio, os dois podem validar e excluir.
- **Alertas:** 30, 15, 7, 1 e 0 dia, mais um resumo às segundas, por e-mail e no painel. O e-mail sai de um **script do Google dentro da planilha** (Apps Script), na conta licitacao@, de licitacao@ para licitacao@. Decisão de 27/10/2026: os conectores do Claude estão na conta da Castelo Branco e não podem enviar como licitacao@.
- **Conformidade:** documentos Validados e no prazo ÷ (total − "Não se aplica").

## Retomar numa máquina nova (Windows)

1. Instale **Node.js LTS** (https://nodejs.org) e **Git** (https://git-scm.com/download/win). Feche e abra o PowerShell.
2. Libere os scripts do npm uma vez: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` (responda **S**).
3. Baixe o projeto e instale as dependências:
   ```powershell
   cd "$HOME\Documents"
   git clone https://github.com/licitacao-girohub/Licitacao-Girohub.git girohub-licitacoes
   cd girohub-licitacoes
   npm install
   ```
   No login do GitHub, escolha **Sign in with a code** e autorize em https://github.com/login/device com a conta **licitacao-girohub**.
4. **Recrie o `.env.local`.** Ele **não vai para o GitHub** porque guarda senhas. Há duas opções:
   - Copie o `.env.local` da máquina antiga por um meio seguro (pendrive ou cofre de senhas). Nunca por e-mail ou chat.
   - Ou gere tudo de novo:
     ```powershell
     Copy-Item .env.example .env.local
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"   # → SESSION_SECRET
     npm run senha    # cadastre ruan e olavio NA MESMA execução → AUTH_USERS_B64
     notepad .env.local   # DATA_MODE=demo + os dois valores; salve com Ctrl+S
     ```
5. Rode `npm run dev` e abra http://localhost:3000.

## Próxima etapa: Google Cloud (README, seção 2)

Faça tudo logado como **licitacao@girohub.com.br**:

1. Crie o projeto **GiroHub Licitações**.
2. Ative a **Google Drive API** e a **Google Sheets API**.
3. Configure a tela de consentimento como **Interno**. Se essa opção não existir, use **Externo** e clique em **Publicar app**. Nunca deixe em "Teste": a autorização expira em 7 dias.
4. Crie um **ID do cliente OAuth** do tipo **App para computador**. Coloque `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` no `.env.local`.
5. Rode `npm run google:auth` e copie o `GOOGLE_REFRESH_TOKEN`.
6. Rode `npm run google:setup` e copie o `SHEET_ID` e o `DRIVE_ROOT_ID`.
7. Troque para `DATA_MODE=google`, rode `npm run dev` e teste anexar um arquivo, gerar um PDF e conferir se aparecem na planilha e no Drive.
8. Instale os alertas por e-mail na planilha, seguindo `docs/apps-script/COMO-INSTALAR.md` (cerca de 5 minutos).

## Pontos de atenção

- **Integração com o Google nunca foi testada ao vivo.** O código passou por revisão independente, mas no primeiro `google:setup` podem aparecer ajustes. Se der erro, mande o print ao Claude.
- **Na Vercel, use um `SESSION_SECRET` novo**, diferente do usado na máquina local.
- **Acesso do Claude ao GitHub:** para o Claude enviar atualizações direto ao repositório, a conta do GitHub ligada ao Claude precisa ser colaboradora com escrita, com o convite **aceito**. Até lá, as atualizações vão pela máquina local com `git push`.
- **Atalhos de emissão:** só os links oficiais confirmados vieram cadastrados (Receita, Caixa, TST, TCU, Compras.gov, JUCESP, TJSP, SEFAZ-BA, TJBA). Os demais o Olávio cadastra na primeira emissão.
