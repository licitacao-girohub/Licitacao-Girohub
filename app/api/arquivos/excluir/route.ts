import { revalidatePath } from 'next/cache';
import { rota, documentoOuErro, ErroApi } from '@/lib/api';
import { arquivos, repo } from '@/lib/repo';

export const POST = rota(async (u, c) => {
  const d = await documentoOuErro(c.docId);
  if (!d.arquivo_id) throw new ErroApi('Não há arquivo para excluir.');
  await arquivos().excluir(d.arquivo_id);
  const novoStatus = d.status === 'Validado' || d.status === 'Em verificação' ? 'Pendente' : d.status;
  await repo().atualizar(d.id, { arquivo_id: '', arquivo_nome: '', arquivo_link: '', status: novoStatus }, u.nome);
  await repo().registrar({ usuario: u.nome, documento_id: d.id, acao: 'Excluiu arquivo', detalhe: `${d.arquivo_nome} (lixeira do Drive)${novoStatus !== d.status ? ` · status → ${novoStatus}` : ''}`, arquivo_id: '' });
  revalidatePath('/', 'layout');
  return { mensagem: 'Arquivo movido para a lixeira do Drive (recuperável por 30 dias).' };
});
