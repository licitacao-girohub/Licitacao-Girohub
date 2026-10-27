'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { criarSessao, encerrarSessao, exigirUsuario, verificarCredenciais } from '@/lib/auth';
import { repo } from '@/lib/repo';
import { STATUS, type Documento, type Status } from '@/lib/model';

export async function entrar(_prev: { erro?: string; usuario?: string } | undefined, form: FormData) {
  const usuario = String(form.get('usuario') ?? '');
  const senha = String(form.get('senha') ?? '');
  if (!usuario || !senha) return { erro: 'Informe usuário e senha.', usuario };
  const u = await verificarCredenciais(usuario, senha);
  if (!u) return { erro: 'Usuário ou senha incorretos.', usuario };
  await criarSessao(u);
  redirect('/');
}

export async function sair() {
  await encerrarSessao();
  redirect('/login');
}

export interface ResultadoSalvar { ok?: boolean; erro?: string; }

export async function salvarDocumento(_prev: ResultadoSalvar | undefined, form: FormData): Promise<ResultadoSalvar> {
  const u = await exigirUsuario();
  const id = String(form.get('id') ?? '');
  const atual = await repo().obter(id);
  if (!atual) return { erro: 'Documento não encontrado.' };

  const status = String(form.get('status') ?? '') as Status;
  if (!STATUS.includes(status)) return { erro: 'Status inválido.' };
  const data = String(form.get('data_emissao') ?? '').trim();
  if (data && !/^\d{4}-\d{2}-\d{2}$/.test(data)) return { erro: 'Data de emissão inválida.' };
  const vdTxt = String(form.get('validade_dias') ?? '').trim();
  const vd = vdTxt === '' ? '' : Number(vdTxt);
  if (vd !== '' && (!Number.isInteger(vd) || vd <= 0 || vd > 3650)) return { erro: 'Validade em dias deve ser um número inteiro entre 1 e 3650.' };
  const link = String(form.get('link_emissao') ?? '').trim();
  if (link && !/^https:\/\//i.test(link)) return { erro: 'O atalho de emissão precisa começar com https://' };
  if (status === 'Validado' && !atual.arquivo_id) return { erro: 'Para marcar como Validado, anexe antes o arquivo de evidência.' };

  const patch: Partial<Documento> = {
    status, data_emissao: data, validade_dias: vd, link_emissao: link,
    observacao: String(form.get('observacao') ?? '').trim(),
  };
  const mudou = (Object.keys(patch) as (keyof Documento)[]).filter((k) => String(patch[k] ?? '') !== String(atual[k] ?? ''));
  if (!mudou.length) return { ok: true };

  await repo().atualizar(id, patch, u.nome);
  const nomes: Record<string, string> = { status: 'status', data_emissao: 'data de emissão', validade_dias: 'validade', link_emissao: 'atalho', observacao: 'observação' };
  const detalhe = mudou.map((k) => (k === 'status' ? `status: ${atual.status} → ${status}` : nomes[k])).join('; ');
  await repo().registrar({ usuario: u.nome, documento_id: id, acao: status === 'Validado' && atual.status !== 'Validado' ? 'Validou' : 'Atualizou', detalhe, arquivo_id: '' });
  revalidatePath('/', 'layout');
  return { ok: true };
}
