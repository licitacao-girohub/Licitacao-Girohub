import type { Documento, Evento } from './model';

export interface ArquivoInfo { id: string; nome: string; link: string; mime: string; }

export interface Repo {
  listar(): Promise<Documento[]>;
  obter(id: string): Promise<Documento | null>;
  atualizar(id: string, patch: Partial<Documento>, usuario: string): Promise<Documento>;
  historico(opts?: { limite?: number; documentoId?: string }): Promise<Evento[]>;
  registrar(ev: Omit<Evento, 'quando'>): Promise<void>;
  linkPlanilha(): string | null;
}

export interface Arquivos {
  /** Abre sessão de upload direto do navegador para a pasta indicada. */
  iniciarUpload(p: { pastaCaminho: string[]; nome: string; mime: string; tamanho: number; origin: string }): Promise<{ url: string }>;
  /** Confirma o arquivo enviado e garante que está na pasta esperada. */
  concluirUpload(p: { fileId?: string; nome: string; pastaCaminho: string[] }): Promise<ArquivoInfo>;
  enviarBuffer(p: { pastaCaminho: string[]; nome: string; mime: string; buffer: Buffer }): Promise<ArquivoInfo>;
  /** Gera PDF a partir de um .docx ou Google Doc e salva na mesma pasta. */
  gerarPdf(fileId: string): Promise<ArquivoInfo>;
  excluir(fileId: string): Promise<void>;
  linkDe(fileId: string): string;
  pastaRaizLink(): string | null;
}

export const MIME_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
export const MIME_GDOC = 'application/vnd.google-apps.document';
export const MIME_PDF = 'application/pdf';
