import { revalidatePath } from 'next/cache';
import { rota, documentoOuErro } from '@/lib/api';
import { arquivos, repo, BIBLIOTECA } from '@/lib/repo';

export const POST = rota(async (u, c) => {
  const d = await documentoOuErro(c.docId);
  const f = await arquivos().concluirUpload({ fileId: c.fileId ? String(c.fileId) : undefined, nome: `${d.id}_${String(c.nome ?? '')}`, pastaCaminho: [BIBLIOTECA, d.pasta] });
  const novoStatus = d.status === 'Pendente' || d.status === 'Não comprovado' ? 'Em verificação' : d.status;
  await repo().atualizar(d.id, { arquivo_id: f.id, arquivo_nome: f.nome, arquivo_link: f.link, status: novoStatus }, u.nome);
  await repo().registrar({ usuario: u.nome, documento_id: d.id, acao: d.arquivo_id ? 'Substituiu arquivo' : 'Anexou arquivo', detalhe: f.nome + (novoStatus !== d.status ? ` · status → ${novoStatus}` : ''), arquivo_id: f.id });
  revalidatePath('/', 'layout');
  return { mensagem: `Arquivo anexado.${novoStatus !== d.status ? ' Status passou para “Em verificação”.' : ''} Confira a data de emissão e a validade.` };
});
