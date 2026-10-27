// Regras de negócio do checklist mestre. Tudo aqui é cálculo puro (sem I/O).

export const STATUS = ['Não comprovado', 'Pendente', 'Em verificação', 'Modelo pronto', 'Validado', 'Não se aplica'] as const;
export type Status = (typeof STATUS)[number];
export const TIPOS = ['Obter', 'Produzir', 'Conquistar'] as const;
export type Tipo = (typeof TIPOS)[number];

export const PASTAS = [
  '00_Fonte_Oficial', '01_Análise_Edital', '02_Habilitação_Jurídica_Fiscal', '03_Econômico_Financeira', '04_Atestados',
  '05_Proposta_Técnica', '06_Proposta_Comercial', '07_Declarações', '08_Esclarecimentos_Diligências', '09_Sessão_Resultado',
  '10_Contrato_Execução', '11_Atestado_Pós_Contrato',
] as const;

/** Colunas da aba "Documentos" na planilha do sistema, na ordem exata. */
export const COLUNAS = [
  'id', 'num', 'grupo', 'tipo', 'item', 'base_legal', 'onde_obter', 'validade_tipica', 'responsavel', 'recorrencia',
  'status', 'data_emissao', 'validade_dias', 'vence_em', 'dias_restantes', 'alerta',
  'arquivo_id', 'arquivo_nome', 'arquivo_link', 'link_emissao', 'pasta', 'observacao', 'atualizado_por', 'atualizado_em',
] as const;
/** Colunas calculadas por fórmula na planilha (o sistema não grava valor, só a fórmula). */
export const COLUNAS_FORMULA = ['vence_em', 'dias_restantes', 'alerta'] as const;

export interface Documento {
  id: string;
  num: number;
  grupo: string;
  tipo: Tipo;
  item: string;
  base_legal: string;
  onde_obter: string;
  validade_tipica: string;
  responsavel: string;
  recorrencia: string;
  status: Status;
  data_emissao: string; // AAAA-MM-DD ou ''
  validade_dias: number | '';
  arquivo_id: string;
  arquivo_nome: string;
  arquivo_link: string;
  link_emissao: string;
  pasta: string;
  observacao: string;
  atualizado_por: string;
  atualizado_em: string;
  _row?: number; // linha na planilha (1-based), quando vier do Sheets
}

export interface Evento {
  quando: string; // ISO
  usuario: string;
  documento_id: string;
  acao: string;
  detalhe: string;
  arquivo_id: string;
}

export type NivelAlerta = 'vencido' | 'hoje' | 'critico' | 'atencao' | 'renovar' | 'ok' | 'sem_prazo' | 'sem_data';

export interface Situacao {
  venceEm: string | null; // AAAA-MM-DD
  diasRestantes: number | null;
  nivel: NivelAlerta;
  rotulo: string;
  conforme: boolean;
  contaNoTotal: boolean;
  inconsistencia: string | null;
}

/** Marcos de alerta por e-mail (dias antes do vencimento). */
export const MARCOS = [30, 15, 7, 1, 0] as const;
export const JANELA_ALERTA = 30;

const MS_DIA = 86_400_000;

/** Data de hoje no fuso de Brasília, como AAAA-MM-DD. */
export function hojeBR(agora = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(agora);
}

function toUTC(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function somaDias(iso: string, dias: number): string {
  return new Date(toUTC(iso) + dias * MS_DIA).toISOString().slice(0, 10);
}

export function difDias(deIso: string, ateIso: string): number {
  return Math.round((toUTC(ateIso) - toUTC(deIso)) / MS_DIA);
}

export function formataData(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function situacao(doc: Documento, hoje = hojeBR()): Situacao {
  const temPrazo = doc.validade_dias !== '' && Number(doc.validade_dias) > 0;
  const naoSeAplica = doc.status === 'Não se aplica';
  let venceEm: string | null = null;
  let diasRestantes: number | null = null;
  let nivel: NivelAlerta = 'sem_prazo';

  if (temPrazo && doc.data_emissao) {
    venceEm = somaDias(doc.data_emissao, Number(doc.validade_dias));
    diasRestantes = difDias(hoje, venceEm);
    if (diasRestantes < 0) nivel = 'vencido';
    else if (diasRestantes === 0) nivel = 'hoje';
    else if (diasRestantes <= 7) nivel = 'critico';
    else if (diasRestantes <= 15) nivel = 'atencao';
    else if (diasRestantes <= JANELA_ALERTA) nivel = 'renovar';
    else nivel = 'ok';
  } else if (temPrazo && !doc.data_emissao) {
    nivel = 'sem_data';
  }

  let inconsistencia: string | null = null;
  if (doc.status === 'Validado' && nivel === 'vencido') inconsistencia = 'Marcado como Validado, mas o documento está vencido.';
  else if (doc.status === 'Validado' && nivel === 'sem_data') inconsistencia = 'Marcado como Validado sem data de emissão: não há como controlar o vencimento.';
  else if (doc.status === 'Validado' && !doc.arquivo_id) inconsistencia = 'Marcado como Validado sem arquivo de evidência.';

  const conforme = !naoSeAplica && doc.status === 'Validado' && nivel !== 'vencido' && nivel !== 'sem_data';

  const rotulos: Record<NivelAlerta, string> = {
    vencido: 'Vencido', hoje: 'Vence hoje', critico: `Vence em ${diasRestantes} d`, atencao: `Vence em ${diasRestantes} d`,
    renovar: `Renovar (${diasRestantes} d)`, ok: 'Em dia', sem_prazo: 'Sem prazo', sem_data: 'Sem data de emissão',
  };

  return { venceEm, diasRestantes, nivel, rotulo: rotulos[nivel], conforme, contaNoTotal: !naoSeAplica, inconsistencia };
}

export function statusEfetivo(doc: Documento, s = situacao(doc)): string {
  if (doc.status === 'Validado' && s.nivel === 'vencido') return 'Vencido';
  return doc.status;
}

export interface Indicador { nome: string; conformes: number; total: number; pct: number | null; }

function indicador(nome: string, docs: Documento[], hoje: string): Indicador {
  const sits = docs.map((d) => situacao(d, hoje));
  const total = sits.filter((s) => s.contaNoTotal).length;
  const conformes = sits.filter((s) => s.conforme).length;
  return { nome, conformes, total, pct: total ? Math.round((conformes / total) * 1000) / 10 : null };
}

export function conformidade(docs: Documento[], hoje = hojeBR()) {
  const grupos = [...new Set(docs.map((d) => d.grupo))].sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));
  return {
    geral: indicador('Geral', docs, hoje),
    porGrupo: grupos.map((g) => indicador(g, docs.filter((d) => d.grupo === g), hoje)),
    porTipo: TIPOS.map((t) => indicador(t, docs.filter((d) => d.tipo === t), hoje)),
    porStatus: STATUS.map((st) => ({ status: st, qtd: docs.filter((d) => d.status === st).length })),
  };
}

export function alertas(docs: Documento[], hoje = hojeBR()) {
  return docs
    .map((d) => ({ doc: d, s: situacao(d, hoje) }))
    .filter(({ doc, s }) => doc.status !== 'Não se aplica' && ['vencido', 'hoje', 'critico', 'atencao', 'renovar'].includes(s.nivel))
    .sort((a, b) => (a.s.diasRestantes ?? 0) - (b.s.diasRestantes ?? 0));
}

/** Marco de e-mail atingido hoje (30, 15, 7, 1 ou 0 dia), ou null. Vencidos não repetem e-mail diário. */
export function marcoDeHoje(s: Situacao): number | null {
  if (s.diasRestantes === null) return null;
  return (MARCOS as readonly number[]).includes(s.diasRestantes) ? s.diasRestantes : null;
}
