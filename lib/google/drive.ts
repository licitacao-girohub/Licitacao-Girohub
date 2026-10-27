import 'server-only';
import { Readable } from 'node:stream';
import { drive as driveApi, type drive_v3 } from '@googleapis/drive';
import { googleAuth, accessToken } from './client';
import { MIME_DOCX, MIME_GDOC, MIME_PDF, type ArquivoInfo, type Arquivos } from '../tipos-repo';

const FOLDER = 'application/vnd.google-apps.folder';
const CAMPOS = 'id,name,mimeType,webViewLink,parents';

function api(): drive_v3.Drive {
  return driveApi({ version: 'v3', auth: googleAuth() });
}
function raiz(): string {
  const id = process.env.DRIVE_ROOT_ID;
  if (!id) throw new Error('DRIVE_ROOT_ID não configurado.');
  return id;
}
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const info = (f: drive_v3.Schema$File): ArquivoInfo => ({
  id: f.id!, nome: f.name ?? '', mime: f.mimeType ?? '', link: f.webViewLink ?? `https://drive.google.com/file/d/${f.id}/view`,
});

const pastas = new Map<string, string>();

/** Garante a cadeia de pastas abaixo da pasta raiz do sistema e devolve o id da última. */
export async function garantirPasta(caminho: string[]): Promise<string> {
  let pai = raiz();
  for (let i = 0; i < caminho.length; i += 1) {
    const chave = caminho.slice(0, i + 1).join('/');
    const emCache = pastas.get(chave);
    if (emCache) { pai = emCache; continue; }
    const q = `'${pai}' in parents and name = '${esc(caminho[i])}' and mimeType = '${FOLDER}' and trashed = false`;
    const res = await api().files.list({ q, fields: 'files(id)', pageSize: 1, supportsAllDrives: true, includeItemsFromAllDrives: true });
    let id = res.data.files?.[0]?.id;
    if (!id) {
      const c = await api().files.create({ requestBody: { name: caminho[i], mimeType: FOLDER, parents: [pai] }, fields: 'id', supportsAllDrives: true });
      id = c.data.id!;
    }
    pastas.set(chave, id);
    pai = id;
  }
  return pai;
}

/** Se uma pasta em cache foi apagada no Drive (404), limpa o cache e tenta de novo uma vez. */
async function comPastaAtual<T>(fn: () => Promise<T>): Promise<T> {
  try { return await fn(); } catch (e) {
    const status = (e as { code?: number; status?: number }).code ?? (e as { status?: number }).status;
    if (status !== 404 && !/\(404\)|notFound/i.test(String((e as Error).message))) throw e;
    pastas.clear();
    return fn();
  }
}

export const driveArquivos: Arquivos = {
  iniciarUpload: (p) => comPastaAtual(async () => {
    const { pastaCaminho, nome, mime, tamanho, origin } = p;
    const pasta = await garantirPasta(pastaCaminho);
    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true&fields=id,name,mimeType,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await accessToken()}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': mime || 'application/octet-stream',
        'X-Upload-Content-Length': String(tamanho),
        // O Google libera CORS do link de upload para a origem informada aqui.
        Origin: origin,
      },
      body: JSON.stringify({ name: nome, parents: [pasta] }),
    });
    const url = res.headers.get('location');
    if (!res.ok || !url) throw new Error(`Drive recusou a sessão de upload (${res.status}): ${await res.text()}`);
    return { url };
  }),

  async concluirUpload({ fileId, nome, pastaCaminho }) {
    const pasta = await garantirPasta(pastaCaminho);
    if (fileId) {
      const f = await api().files.get({ fileId, fields: CAMPOS, supportsAllDrives: true });
      if (!f.data.parents?.includes(pasta)) throw new Error('O arquivo enviado não está na pasta esperada.');
      return info(f.data);
    }
    const q = `'${pasta}' in parents and name = '${esc(nome)}' and trashed = false`;
    const r = await api().files.list({ q, fields: `files(${CAMPOS})`, orderBy: 'createdTime desc', pageSize: 1, supportsAllDrives: true, includeItemsFromAllDrives: true });
    const f = r.data.files?.[0];
    if (!f) throw new Error('O arquivo não chegou ao Drive. Tente enviar de novo.');
    return info(f);
  },

  enviarBuffer: ({ pastaCaminho, nome, mime, buffer }) => comPastaAtual(async () => {
    const pasta = await garantirPasta(pastaCaminho);
    const f = await api().files.create({
      requestBody: { name: nome, parents: [pasta] }, media: { mimeType: mime, body: Readable.from(buffer) }, fields: CAMPOS, supportsAllDrives: true,
    });
    return info(f.data);
  }),

  async gerarPdf(fileId) {
    const meta = (await api().files.get({ fileId, fields: CAMPOS, supportsAllDrives: true })).data;
    const pai = meta.parents?.[0];
    if (!pai) throw new Error('Arquivo sem pasta de origem.');
    let origem = fileId;
    let temporario: string | null = null;
    if (meta.mimeType === MIME_DOCX) {
      // O Drive só exporta PDF de documentos Google: converte uma cópia temporária.
      const c = await api().files.copy({ fileId, requestBody: { name: `~tmp ${meta.name}`, mimeType: MIME_GDOC, parents: [pai] }, fields: 'id', supportsAllDrives: true });
      origem = c.data.id!;
      temporario = origem;
    } else if (meta.mimeType !== MIME_GDOC) {
      throw new Error('Só é possível gerar PDF de arquivos Word (.docx) ou Google Docs.');
    }
    try {
      const pdf = await api().files.export({ fileId: origem, mimeType: MIME_PDF }, { responseType: 'arraybuffer' });
      const nome = `${(meta.name ?? 'documento').replace(/\.docx$/i, '')}.pdf`;
      const f = await api().files.create({
        requestBody: { name: nome, parents: [pai] }, media: { mimeType: MIME_PDF, body: Readable.from(Buffer.from(pdf.data as ArrayBuffer)) }, fields: CAMPOS, supportsAllDrives: true,
      });
      return info(f.data);
    } finally {
      if (temporario) {
        const tmp = temporario;
        // Em Drive compartilhado, apagar exige papel de Administrador; se falhar, manda a cópia para a lixeira.
        await api().files.delete({ fileId: tmp, supportsAllDrives: true })
          .catch(() => api().files.update({ fileId: tmp, requestBody: { trashed: true }, supportsAllDrives: true }))
          .catch((e) => console.error('[drive] cópia temporária não removida', tmp, e));
      }
    }
  },

  async excluir(fileId) {
    // Vai para a lixeira do Drive (recuperável por 30 dias), não é exclusão definitiva.
    await api().files.update({ fileId, requestBody: { trashed: true }, supportsAllDrives: true });
  },

  linkDe(fileId) {
    return `https://drive.google.com/file/d/${fileId}/view`;
  },

  pastaRaizLink() {
    return process.env.DRIVE_ROOT_ID ? `https://drive.google.com/drive/folders/${process.env.DRIVE_ROOT_ID}` : null;
  },
};
