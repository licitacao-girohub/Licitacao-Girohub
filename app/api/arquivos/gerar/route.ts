import { revalidatePath } from 'next/cache';
import { rota, documentoOuErro, ErroApi } from '@/lib/api';
import { arquivos, repo, CERTAME_PILOTO } from '@/lib/repo';
import { gerarModelo } from '@/lib/templates/crmv-es.mjs';
import { MIME_DOCX } from '@/lib/tipos-repo';

export const maxDuration = 60;

export const POST = rota(async (u, c) => {
  const d = await documentoOuErro(c.docId);
  const m = await gerarModelo(d.num);
  if (!m) throw new ErroApi('Este item não tem modelo Word.');
  const f = await arquivos().enviarBuffer({ pastaCaminho: [...CERTAME_PILOTO, m.pasta], nome: m.nome, mime: MIME_DOCX, buffer: m.buffer });
  const novoStatus = d.status === 'Validado' ? d.status : 'Modelo pronto';
  await repo().atualizar(d.id, { arquivo_id: f.id, arquivo_nome: f.nome, arquivo_link: f.link, status: novoStatus }, u.nome);
  await repo().registrar({ usuario: u.nome, documento_id: d.id, acao: 'Gerou Word', detalhe: f.nome, arquivo_id: f.id });
  revalidatePath('/', 'layout');
  return { mensagem: `Word gerado em ${CERTAME_PILOTO.join('/')}/${m.pasta}. Campos em amarelo exigem prova antes do envio.` };
});
