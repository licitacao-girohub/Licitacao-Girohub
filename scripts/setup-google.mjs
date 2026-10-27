// Cria, na conta Google da GiroHub, a planilha nova do sistema e a estrutura de pastas no Drive.
// Uso: npm run google:setup   (rode uma vez; depois copie SHEET_ID e DRIVE_ROOT_ID para .env.local e Vercel)
//
// O que é criado:
//   Drive: "GiroHub – Licitações"/
//            Biblioteca_Checklist_Mestre/00_… a 11_…   (documentos permanentes do checklist)
//            Certames/CRMV-ES_DE-51-2026/00_… a 11_…   (pacote do piloto, com os 9 Word "Produzir")
//   Planilha (criada dentro da pasta raiz) "Checklist Mestre – Licitações GiroHub (Sistema)" com as abas
//            Documentos · Historico · Editais lidos · Alertas_enviados · Leia-me
//   A planilha nasce da Checklist_Mestre_Licitacoes_GiroHub v0.1 (data/seed.json), com as linhas compostas separadas.
import { Readable } from 'node:stream';
import fs from 'node:fs';
import { sheets as sheetsApi } from '@googleapis/sheets';
import { drive as driveApi } from '@googleapis/drive';
import { OAuth2Client, JWT } from 'google-auth-library';
import { carregarEnv } from './_env.mjs';
import { NUMS_COM_MODELO, gerarModelo } from '../lib/templates/crmv-es.mjs';

carregarEnv();
const forcar = process.argv.includes('--forcar');
if (process.env.SHEET_ID && !forcar) {
  console.error('SHEET_ID já está configurado. A estrutura já existe. Para criar outra do zero, rode: npm run google:setup -- --forcar');
  process.exit(1);
}

function auth() {
  const escopos = ['https://www.googleapis.com/auth/drive.file'];
  if ((process.env.GOOGLE_AUTH_MODE || 'oauth') === 'service_account') {
    const k = JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_B64 || '', 'base64').toString('utf8'));
    return new JWT({ email: k.client_email, key: k.private_key, scopes: escopos });
  }
  const { GOOGLE_CLIENT_ID: id, GOOGLE_CLIENT_SECRET: sec, GOOGLE_REFRESH_TOKEN: rt } = process.env;
  if (!id || !sec || !rt) { console.error('Faltam GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET ou GOOGLE_REFRESH_TOKEN no .env.local.'); process.exit(1); }
  const c = new OAuth2Client({ clientId: id, clientSecret: sec });
  c.setCredentials({ refresh_token: rt });
  return c;
}

const a = auth();
const sheets = sheetsApi({ version: 'v4', auth: a });
const drive = driveApi({ version: 'v3', auth: a });
const seed = JSON.parse(fs.readFileSync(new URL('../data/seed.json', import.meta.url)));
const FOLDER = 'application/vnd.google-apps.folder';
const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const PASTAS = ['00_Fonte_Oficial', '01_Análise_Edital', '02_Habilitação_Jurídica_Fiscal', '03_Econômico_Financeira', '04_Atestados', '05_Proposta_Técnica', '06_Proposta_Comercial', '07_Declarações', '08_Esclarecimentos_Diligências', '09_Sessão_Resultado', '10_Contrato_Execução', '11_Atestado_Pós_Contrato'];
const COLUNAS = ['id', 'num', 'grupo', 'tipo', 'item', 'base_legal', 'onde_obter', 'validade_tipica', 'responsavel', 'recorrencia', 'status', 'data_emissao', 'validade_dias', 'vence_em', 'dias_restantes', 'alerta', 'arquivo_id', 'arquivo_nome', 'arquivo_link', 'link_emissao', 'pasta', 'observacao', 'atualizado_por', 'atualizado_em'];
const STATUS = ['Não comprovado', 'Pendente', 'Em verificação', 'Modelo pronto', 'Validado', 'Não se aplica'];

const txt = (v) => { const s = (v == null ? '' : String(v)).replace(/^'+/, ''); return /^[=+\-@\d]/.test(s) ? `'${s}` : s; };
function linha(d, r) {
  const m = {
    ...Object.fromEntries(COLUNAS.map((c) => [c, txt(d[c])])),
    num: d.num, validade_dias: d.validade_dias === '' ? '' : Number(d.validade_dias), data_emissao: '',
    vence_em: `=IF(OR(L${r}="",M${r}=""),"",L${r}+M${r})`,
    dias_restantes: `=IF(N${r}="","",N${r}-TODAY())`,
    alerta: `=IF(O${r}="","",IF(O${r}<0,"VENCIDO",IF(O${r}<=30,"Renovar","OK")))`,
  };
  return COLUNAS.map((c) => m[c]);
}

async function pasta(nome, pai) {
  const r = await drive.files.create({ requestBody: { name: nome, mimeType: FOLDER, parents: pai ? [pai] : undefined }, fields: 'id', supportsAllDrives: true });
  return r.data.id;
}

console.log('1/5 Criando pastas no Drive…');
// DRIVE_PARENT_ID (opcional): pasta ou Drive compartilhado onde criar a raiz. Obrigatório no modo conta de serviço.
if ((process.env.GOOGLE_AUTH_MODE || 'oauth') === 'service_account' && !process.env.DRIVE_PARENT_ID) {
  console.error('No modo conta de serviço, informe DRIVE_PARENT_ID (pasta dentro de um Drive compartilhado).'); process.exit(1);
}
const raiz = await pasta('GiroHub – Licitações', process.env.DRIVE_PARENT_ID || undefined);
const biblioteca = await pasta('Biblioteca_Checklist_Mestre', raiz);
for (const p of PASTAS) await pasta(p, biblioteca);
const certames = await pasta('Certames', raiz);
const piloto = await pasta('CRMV-ES_DE-51-2026', certames);
const pastasPiloto = {};
for (const p of PASTAS) pastasPiloto[p] = await pasta(p, piloto);

console.log('2/5 Enviando os 9 Word do piloto CRMV-ES…');
const agora = new Date().toISOString();
const docs = seed.documentos.map((d) => ({ ...d }));
const hist = [];
for (const num of NUMS_COM_MODELO) {
  const m = await gerarModelo(num);
  const f = await drive.files.create({
    requestBody: { name: m.nome, parents: [pastasPiloto[m.pasta]] }, media: { mimeType: DOCX, body: Readable.from(m.buffer) },
    fields: 'id,name,webViewLink', supportsAllDrives: true,
  });
  const d = docs.find((x) => x.num === num);
  Object.assign(d, { arquivo_id: f.data.id, arquivo_nome: f.data.name, arquivo_link: f.data.webViewLink });
  hist.push([agora, 'Configuração inicial', d.id, 'Gerou Word', f.data.name, f.data.id]);
  console.log(`   ✓ ${m.nome}`);
}

console.log('3/5 Criando a planilha…');
// Criada pelo Drive já dentro da pasta raiz (vale para OAuth e para conta de serviço em Drive compartilhado).
const arq = await drive.files.create({
  requestBody: { name: 'Checklist Mestre – Licitações GiroHub (Sistema)', mimeType: 'application/vnd.google-apps.spreadsheet', parents: [raiz] },
  fields: 'id', supportsAllDrives: true,
});
const sid = arq.data.id;
const inicial = await sheets.spreadsheets.get({ spreadsheetId: sid, fields: 'sheets.properties' });
const primeira = inicial.data.sheets[0].properties.sheetId;
const ABAS = [
  ['Historico', { frozenRowCount: 1, rowCount: 2000, columnCount: 6 }],
  ['Editais lidos', { frozenRowCount: 1 }],
  ['Alertas_enviados', { frozenRowCount: 1, columnCount: 5 }],
  ['Leia-me', {}],
];
const criadas = await sheets.spreadsheets.batchUpdate({
  spreadsheetId: sid,
  requestBody: {
    requests: [
      { updateSpreadsheetProperties: { properties: { locale: 'en_US', timeZone: 'America/Sao_Paulo' }, fields: 'locale,timeZone' } },
      { updateSheetProperties: { properties: { sheetId: primeira, title: 'Documentos', gridProperties: { frozenRowCount: 1, rowCount: 200, columnCount: COLUNAS.length } }, fields: 'title,gridProperties(frozenRowCount,rowCount,columnCount)' } },
      ...ABAS.map(([title, gridProperties]) => ({ addSheet: { properties: { title, gridProperties } } })),
    ],
  },
});
const ids = { Documentos: primeira };
for (const r of criadas.data.replies) if (r.addSheet) ids[r.addSheet.properties.title] = r.addSheet.properties.sheetId;
const D = ids.Documentos;

console.log('4/5 Gravando dados e formatação…');
await sheets.spreadsheets.batchUpdate({
  spreadsheetId: sid,
  requestBody: {
    requests: [
      ...[11, 13].map((c) => ({ repeatCell: { range: { sheetId: D, startRowIndex: 1, startColumnIndex: c, endColumnIndex: c + 1 }, cell: { userEnteredFormat: { numberFormat: { type: 'DATE', pattern: 'dd/mm/yyyy' } } }, fields: 'userEnteredFormat.numberFormat' } })),
      { repeatCell: { range: { sheetId: D, startRowIndex: 1, startColumnIndex: 14, endColumnIndex: 15 }, cell: { userEnteredFormat: { numberFormat: { type: 'NUMBER', pattern: '0' } } }, fields: 'userEnteredFormat.numberFormat' } },
    ],
  },
});
const valores = [COLUNAS, ...docs.map((d, i) => linha(d, i + 2))];
const cab = Object.keys(seed.editais[0] ?? {});
await sheets.spreadsheets.values.batchUpdate({
  spreadsheetId: sid,
  requestBody: {
    valueInputOption: 'USER_ENTERED',
    data: [
      { range: 'Documentos!A1', values: valores },
      { range: 'Historico!A1', values: [['quando', 'usuario', 'documento_id', 'acao', 'detalhe', 'arquivo_id']] },
      { range: 'Editais lidos!A1', values: [cab, ...seed.editais.map((e) => cab.map((c) => txt(e[c])))] },
      { range: 'Alertas_enviados!A1', values: [['documento_id', 'marco_dias', 'vence_em', 'enviado_em', 'destinatario']] },
      { range: 'Leia-me!A1', values: [
        ['Planilha do sistema de licitações GiroHub — não renomeie abas nem colunas.'],
        ['Origem: Checklist_Mestre_Licitacoes_GiroHub v0.1 (16/10/2026). Linhas compostas separadas: 04a/04b, 07a/07b, 12a/12b.'],
        ['Edite pelo sistema. Colunas vence_em, dias_restantes e alerta são fórmulas.'],
        ['Historico: trilha de tudo que foi alterado pelo sistema. Alertas_enviados: controle dos e-mails de vencimento (30, 15, 7, 1 e 0 dia).'],
        ['Status "Não comprovado" = não há evidência; nunca preencher com suposição.'],
      ] },
    ],
  },
});
if (hist.length) {
  await sheets.spreadsheets.values.append({ spreadsheetId: sid, range: 'Historico!A:F', valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS', requestBody: { values: hist } });
}
const cabecalho = (sheetId) => ({ repeatCell: { range: { sheetId, startRowIndex: 0, endRowIndex: 1 }, cell: { userEnteredFormat: { backgroundColor: { red: 0.059, green: 0.169, blue: 0.341 }, textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } } } }, fields: 'userEnteredFormat(backgroundColor,textFormat)' } });
const largura = (col, px) => ({ updateDimensionProperties: { range: { sheetId: D, dimension: 'COLUMNS', startIndex: col, endIndex: col + 1 }, properties: { pixelSize: px }, fields: 'pixelSize' } });
await sheets.spreadsheets.batchUpdate({
  spreadsheetId: sid,
  requestBody: {
    requests: [
      cabecalho(D), cabecalho(ids.Historico), cabecalho(ids['Editais lidos']), cabecalho(ids.Alertas_enviados),
      { setDataValidation: { range: { sheetId: D, startRowIndex: 1, startColumnIndex: 10, endColumnIndex: 11 }, rule: { condition: { type: 'ONE_OF_LIST', values: STATUS.map((v) => ({ userEnteredValue: v })) }, strict: true, showCustomUi: true } } },
      { setDataValidation: { range: { sheetId: D, startRowIndex: 1, startColumnIndex: 3, endColumnIndex: 4 }, rule: { condition: { type: 'ONE_OF_LIST', values: ['Obter', 'Produzir', 'Conquistar'].map((v) => ({ userEnteredValue: v })) }, strict: true, showCustomUi: true } } },
      { addConditionalFormatRule: { index: 0, rule: { ranges: [{ sheetId: D, startRowIndex: 1, startColumnIndex: 15, endColumnIndex: 16 }], booleanRule: { condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'VENCIDO' }] }, format: { backgroundColor: { red: 0.973, green: 0.843, blue: 0.855 } } } } } },
      { addConditionalFormatRule: { index: 1, rule: { ranges: [{ sheetId: D, startRowIndex: 1, startColumnIndex: 15, endColumnIndex: 16 }], booleanRule: { condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'Renovar' }] }, format: { backgroundColor: { red: 0.992, green: 0.906, blue: 0.765 } } } } } },
      largura(2, 210), largura(4, 380), largura(5, 190), largura(6, 230), largura(7, 200), largura(10, 130), largura(21, 320),
      { setBasicFilter: { filter: { range: { sheetId: D, startRowIndex: 0, startColumnIndex: 0, endColumnIndex: COLUNAS.length } } } },
    ],
  },
});

console.log('5/5 Conferindo…');
const conf = await sheets.spreadsheets.values.get({ spreadsheetId: sid, range: 'Documentos!A2:A4' });
console.log('   ids lidos de volta:', (conf.data.values || []).map((v) => v[0]).join(', '), '(esperado: 01, 02, 03)');
console.log('\nPronto. Copie para o .env.local e para as variáveis da Vercel:\n');
console.log(`SHEET_ID=${sid}`);
console.log(`DRIVE_ROOT_ID=${raiz}\n`);
console.log(`Planilha: https://docs.google.com/spreadsheets/d/${sid}/edit`);
console.log(`Pasta:    https://drive.google.com/drive/folders/${raiz}\n`);
