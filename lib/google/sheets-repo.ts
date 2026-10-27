import 'server-only';
import { sheets as sheetsApi, type sheets_v4 } from '@googleapis/sheets';
import { googleAuth } from './client';
import { COLUNAS, type Documento, type Evento, type Status, type Tipo } from '../model';
import type { Repo } from '../tipos-repo';

const ABA = 'Documentos';
const ABA_HIST = 'Historico';
const ULTIMA_COL = 'X'; // 24 colunas (A..X), ver COLUNAS

function api(): sheets_v4.Sheets {
  return sheetsApi({ version: 'v4', auth: googleAuth() });
}
function sheetId(): string {
  const id = process.env.SHEET_ID;
  if (!id) throw new Error('SHEET_ID não configurado.');
  return id;
}

/** Número de série do Sheets (dias desde 30/12/1899) → AAAA-MM-DD. */
function serialParaIso(v: unknown): string {
  if (v === '' || v === null || v === undefined) return '';
  if (typeof v === 'number') return new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 86_400_000).toISOString().slice(0, 10);
  const s = String(v).trim();
  const br = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '';
}

/** Em USER_ENTERED, força texto quando o valor poderia virar número, data ou fórmula. */
function txt(v: unknown): string {
  // Remove apóstrofos que já tenham sido gravados como caractere, para não acumular a cada edição.
  const s = (v === null || v === undefined ? '' : String(v)).replace(/^'+/, '');
  return /^[=+\-@\d]/.test(s) ? `'${s}` : s;
}

export function linhaParaPlanilha(d: Documento, r: number): (string | number)[] {
  const data = d.data_emissao ? (() => { const [y, m, dd] = d.data_emissao.split('-').map(Number); return `=DATE(${y},${m},${dd})`; })() : '';
  const map: Record<string, string | number> = {
    id: txt(d.id), num: d.num, grupo: txt(d.grupo), tipo: txt(d.tipo), item: txt(d.item), base_legal: txt(d.base_legal),
    onde_obter: txt(d.onde_obter), validade_tipica: txt(d.validade_tipica), responsavel: txt(d.responsavel), recorrencia: txt(d.recorrencia),
    status: txt(d.status), data_emissao: data, validade_dias: d.validade_dias === '' ? '' : Number(d.validade_dias),
    vence_em: `=IF(OR(L${r}="",M${r}=""),"",L${r}+M${r})`,
    dias_restantes: `=IF(N${r}="","",N${r}-TODAY())`,
    alerta: `=IF(O${r}="","",IF(O${r}<0,"VENCIDO",IF(O${r}<=30,"Renovar","OK")))`,
    arquivo_id: txt(d.arquivo_id), arquivo_nome: txt(d.arquivo_nome), arquivo_link: txt(d.arquivo_link), link_emissao: txt(d.link_emissao),
    pasta: txt(d.pasta), observacao: txt(d.observacao), atualizado_por: txt(d.atualizado_por), atualizado_em: txt(d.atualizado_em),
  };
  return COLUNAS.map((c) => map[c]);
}

function planilhaParaDoc(row: unknown[], r: number): Documento {
  const g = (c: (typeof COLUNAS)[number]) => row[COLUNAS.indexOf(c)];
  // Defesa: se a célula guardar o apóstrofo como caractere (coluna em formato texto), ele é descartado na leitura.
  const s = (c: (typeof COLUNAS)[number]) => { const v = g(c); return v === undefined || v === null ? '' : String(v).replace(/^'+/, ''); };
  const vd = g('validade_dias');
  return {
    id: s('id'), num: Number(g('num')) || 0, grupo: s('grupo'), tipo: s('tipo') as Tipo, item: s('item'), base_legal: s('base_legal'),
    onde_obter: s('onde_obter'), validade_tipica: s('validade_tipica'), responsavel: s('responsavel'), recorrencia: s('recorrencia'),
    status: (s('status') || 'Pendente') as Status, data_emissao: serialParaIso(g('data_emissao')),
    validade_dias: vd === '' || vd === undefined || vd === null ? '' : Number(vd),
    arquivo_id: s('arquivo_id'), arquivo_nome: s('arquivo_nome'), arquivo_link: s('arquivo_link'), link_emissao: s('link_emissao'),
    pasta: s('pasta'), observacao: s('observacao'), atualizado_por: s('atualizado_por'), atualizado_em: s('atualizado_em'), _row: r,
  };
}

function agoraBR(): string {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }).format(new Date());
}

export const sheetsRepo: Repo = {
  async listar() {
    const res = await api().spreadsheets.values.get({
      spreadsheetId: sheetId(), range: `${ABA}!A2:${ULTIMA_COL}`, valueRenderOption: 'UNFORMATTED_VALUE', dateTimeRenderOption: 'SERIAL_NUMBER',
    });
    return (res.data.values ?? []).map((row, i) => planilhaParaDoc(row, i + 2)).filter((d) => d.id);
  },

  async obter(id) {
    return (await this.listar()).find((d) => d.id === id) ?? null;
  },

  async atualizar(id, patch, usuario) {
    const atual = await this.obter(id);
    if (!atual || !atual._row) throw new Error(`Documento ${id} não encontrado na planilha.`);
    const novo: Documento = { ...atual, ...patch, id: atual.id, atualizado_por: usuario, atualizado_em: agoraBR() };
    const r = atual._row;
    await api().spreadsheets.values.update({
      spreadsheetId: sheetId(), range: `${ABA}!A${r}:${ULTIMA_COL}${r}`, valueInputOption: 'USER_ENTERED',
      requestBody: { values: [linhaParaPlanilha(novo, r)] },
    });
    return novo;
  },

  async historico(opts = {}) {
    const res = await api().spreadsheets.values.get({ spreadsheetId: sheetId(), range: `${ABA_HIST}!A2:F` });
    let evs: Evento[] = (res.data.values ?? []).map((v) => ({
      quando: String(v[0] ?? ''), usuario: String(v[1] ?? ''), documento_id: String(v[2] ?? ''), acao: String(v[3] ?? ''), detalhe: String(v[4] ?? ''), arquivo_id: String(v[5] ?? ''),
    }));
    if (opts.documentoId) evs = evs.filter((e) => e.documento_id === opts.documentoId);
    evs.reverse();
    return opts.limite ? evs.slice(0, opts.limite) : evs;
  },

  async registrar(ev) {
    await api().spreadsheets.values.append({
      spreadsheetId: sheetId(), range: `${ABA_HIST}!A:F`, valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [[new Date().toISOString(), ev.usuario, ev.documento_id, ev.acao, ev.detalhe, ev.arquivo_id]] },
    });
  },

  linkPlanilha() {
    return process.env.SHEET_ID ? `https://docs.google.com/spreadsheets/d/${process.env.SHEET_ID}/edit` : null;
  },
};
