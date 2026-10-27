import { rota, documentoOuErro, ErroApi } from '@/lib/api';
import { arquivos, BIBLIOTECA } from '@/lib/repo';

export const POST = rota(async (_u, c, req) => {
  const d = await documentoOuErro(c.docId);
  const nome = String(c.nome ?? '').trim();
  const tamanho = Number(c.tamanho);
  if (!nome || !Number.isFinite(tamanho) || tamanho <= 0) throw new ErroApi('Arquivo inválido.');
  if (tamanho > 25 * 1024 * 1024) throw new ErroApi('O limite é 25 MB por arquivo.');
  const origin = req.headers.get('origin') ?? new URL(req.url).origin;
  return arquivos().iniciarUpload({ pastaCaminho: [BIBLIOTECA, d.pasta], nome: `${d.id}_${nome}`, mime: String(c.mime || 'application/octet-stream'), tamanho, origin });
});
