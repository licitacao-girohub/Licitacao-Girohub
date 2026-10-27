import { revalidatePath } from 'next/cache';
import { rota, documentoOuErro, ErroApi } from '@/lib/api';
import { arquivos, repo } from '@/lib/repo';

export const maxDuration = 60;

export const POST = rota(async (u, c) => {
  const d = await documentoOuErro(c.docId);
  if (!d.arquivo_id) throw new ErroApi('Anexe ou gere o Word antes.');
  const pdf = await arquivos().gerarPdf(d.arquivo_id);
  await repo().atualizar(d.id, { arquivo_id: pdf.id, arquivo_nome: pdf.nome, arquivo_link: pdf.link }, u.nome);
  await repo().registrar({ usuario: u.nome, documento_id: d.id, acao: 'Gerou PDF', detalhe: pdf.nome, arquivo_id: pdf.id });
  revalidatePath('/', 'layout');
  return { mensagem: 'PDF gerado na mesma pasta e definido como arquivo atual. O Word segue nas versões.' };
});
