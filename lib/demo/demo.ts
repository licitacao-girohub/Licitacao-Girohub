import 'server-only';
// Modo demonstração (DATA_MODE=demo): roda sem Google, gravando em .data/ na máquina local.
// Serve para ver e testar as telas antes de conectar a conta GiroHub. Não funciona na Vercel.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import seed from '@/data/seed.json';
import type { Documento, Evento } from '../model';
import type { Arquivos, Repo } from '../tipos-repo';

const DIR = path.join(process.cwd(), '.data');
const DB = path.join(DIR, 'demo.json');
export const DIR_ARQ = path.join(DIR, 'arquivos');

interface Banco { documentos: Documento[]; historico: Evento[]; arquivos: Record<string, { nome: string; mime: string; pasta: string }>; }

function ler(): Banco {
  if (!fs.existsSync(DB)) {
    fs.mkdirSync(DIR_ARQ, { recursive: true });
    const b: Banco = { documentos: (seed.documentos as unknown as Documento[]).map((d) => ({ ...d })), historico: [], arquivos: {} };
    fs.writeFileSync(DB, JSON.stringify(b, null, 1));
    return b;
  }
  return JSON.parse(fs.readFileSync(DB, 'utf8')) as Banco;
}
function gravar(b: Banco) { fs.writeFileSync(DB, JSON.stringify(b, null, 1)); }
const agora = () => new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }).format(new Date());

export const demoRepo: Repo = {
  async listar() { return ler().documentos; },
  async obter(id) { return ler().documentos.find((d) => d.id === id) ?? null; },
  async atualizar(id, patch, usuario) {
    const b = ler();
    const i = b.documentos.findIndex((d) => d.id === id);
    if (i < 0) throw new Error(`Documento ${id} não encontrado.`);
    b.documentos[i] = { ...b.documentos[i], ...patch, id, atualizado_por: usuario, atualizado_em: agora() };
    gravar(b);
    return b.documentos[i];
  },
  async historico(opts = {}) {
    let evs = [...ler().historico];
    if (opts.documentoId) evs = evs.filter((e) => e.documento_id === opts.documentoId);
    evs.reverse();
    return opts.limite ? evs.slice(0, opts.limite) : evs;
  },
  async registrar(ev) {
    const b = ler();
    b.historico.push({ ...ev, quando: new Date().toISOString() });
    gravar(b);
  },
  linkPlanilha() { return null; },
};

export function registrarArquivoDemo(nome: string, mime: string, pasta: string, conteudo: Buffer): string {
  const b = ler();
  const id = `demo-${crypto.randomBytes(6).toString('hex')}`;
  fs.mkdirSync(DIR_ARQ, { recursive: true });
  fs.writeFileSync(path.join(DIR_ARQ, id), conteudo);
  b.arquivos[id] = { nome, mime, pasta };
  gravar(b);
  return id;
}
export function arquivoDemo(id: string) {
  const meta = ler().arquivos[id];
  if (!meta || !/^demo-[a-f0-9]{12}$/.test(id)) return null;
  return { ...meta, conteudo: fs.readFileSync(path.join(DIR_ARQ, id)) };
}

export const demoArquivos: Arquivos = {
  async iniciarUpload({ pastaCaminho, nome, mime }) {
    const q = new URLSearchParams({ nome, mime, pasta: pastaCaminho.join('/') });
    return { url: `/api/demo/upload?${q}` };
  },
  async concluirUpload({ fileId, nome }) {
    if (!fileId) throw new Error('Envio sem identificador.');
    const m = arquivoDemo(fileId);
    return { id: fileId, nome: m?.nome ?? nome, mime: m?.mime ?? '', link: `/api/demo/arquivo/${fileId}` };
  },
  async enviarBuffer({ pastaCaminho, nome, mime, buffer }) {
    const id = registrarArquivoDemo(nome, mime, pastaCaminho.join('/'), buffer);
    return { id, nome, mime, link: `/api/demo/arquivo/${id}` };
  },
  async gerarPdf() {
    throw new Error('No modo demonstração não há conversão para PDF. Ela funciona com o Google Drive conectado.');
  },
  async excluir(fileId) {
    const b = ler();
    delete b.arquivos[fileId];
    gravar(b);
    fs.rmSync(path.join(DIR_ARQ, fileId), { force: true });
  },
  linkDe(fileId) { return `/api/demo/arquivo/${fileId}`; },
  pastaRaizLink() { return null; },
};
