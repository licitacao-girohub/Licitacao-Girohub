'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ChipSituacao, ChipStatus, ChipTipo } from './Chips';
import { STATUS, TIPOS, formataData, type NivelAlerta } from '@/lib/model';

export interface LinhaDoc {
  id: string; item: string; grupo: string; tipo: string; status: string; statusBruto: string; responsavel: string;
  venceEm: string | null; nivel: NivelAlerta; rotulo: string; dias: number | null; temArquivo: boolean; inconsistente: boolean;
}
interface Filtros { busca: string; grupo: string; tipo: string; status: string; situacao: string; }

const SITUACOES: { v: string; r: string; teste: (l: LinhaDoc) => boolean }[] = [
  { v: 'vencido', r: 'Vencidos', teste: (l) => l.nivel === 'vencido' },
  { v: 'alerta', r: 'Vencem em até 30 dias', teste: (l) => ['hoje', 'critico', 'atencao', 'renovar'].includes(l.nivel) },
  { v: 'sem_data', r: 'Com validade e sem data', teste: (l) => l.nivel === 'sem_data' && l.statusBruto !== 'Não se aplica' },
  { v: 'sem_arquivo', r: 'Sem arquivo', teste: (l) => !l.temArquivo && l.statusBruto !== 'Não se aplica' },
  { v: 'inconsistente', r: 'Com inconsistência', teste: (l) => l.inconsistente },
];

export default function TabelaDocumentos({ linhas, inicial }: { linhas: LinhaDoc[]; inicial: Filtros }) {
  const [f, setF] = useState<Filtros>(inicial);
  const grupos = useMemo(() => [...new Set(linhas.map((l) => l.grupo))].sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true })), [linhas]);
  const filtradas = useMemo(() => {
    const termo = f.busca.trim().toLowerCase();
    const sit = SITUACOES.find((s) => s.v === f.situacao);
    return linhas.filter((l) =>
      (!termo || `${l.id} ${l.item} ${l.responsavel}`.toLowerCase().includes(termo))
      && (!f.grupo || l.grupo === f.grupo) && (!f.tipo || l.tipo === f.tipo)
      && (!f.status || l.statusBruto === f.status) && (!sit || sit.teste(l)));
  }, [linhas, f]);
  const set = (k: keyof Filtros) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const ativo = Object.values(f).some(Boolean);

  return (
    <>
      <div className="filtros">
        <label>Buscar<input value={f.busca} onChange={set('busca')} placeholder="Nome, número ou responsável" /></label>
        <label>Grupo<select value={f.grupo} onChange={set('grupo')}><option value="">Todos</option>{grupos.map((g) => <option key={g}>{g}</option>)}</select></label>
        <label>Tipo<select value={f.tipo} onChange={set('tipo')}><option value="">Todos</option>{TIPOS.map((t) => <option key={t}>{t}</option>)}</select></label>
        <label>Status<select value={f.status} onChange={set('status')}><option value="">Todos</option>{STATUS.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label>Situação<select value={f.situacao} onChange={set('situacao')}><option value="">Todas</option>{SITUACOES.map((s) => <option key={s.v} value={s.v}>{s.r}</option>)}</select></label>
      </div>
      <div className="lado-a-lado small muted" style={{ marginBottom: 8, justifyContent: 'space-between' }}>
        <span>{filtradas.length} de {linhas.length} documentos</span>
        {ativo && <button className="botao b-sec" style={{ padding: '4px 10px' }} onClick={() => setF({ busca: '', grupo: '', tipo: '', status: '', situacao: '' })}>Limpar filtros</button>}
      </div>
      <div className="tabela-wrap">
        <table>
          <thead><tr><th>#</th><th>Documento</th><th>Tipo</th><th>Status</th><th>Vence em</th><th>Situação</th><th>Responsável</th><th>Arquivo</th></tr></thead>
          <tbody>
            {filtradas.map((l) => (
              <tr key={l.id}>
                <td className="id">{l.id}</td>
                <td className="item"><Link href={`/documentos/${l.id}`}>{l.item}</Link><div className="muted small">{l.grupo}</div></td>
                <td><ChipTipo tipo={l.tipo} /></td>
                <td><ChipStatus status={l.status} /></td>
                <td style={{ whiteSpace: 'nowrap' }}>{formataData(l.venceEm)}</td>
                <td><ChipSituacao nivel={l.nivel} rotulo={l.rotulo} /></td>
                <td className="muted">{l.responsavel}</td>
                <td>{l.temArquivo ? <span className="chip c-bom">Anexado</span> : <span className="muted small">—</span>}</td>
              </tr>
            ))}
            {filtradas.length === 0 && <tr><td colSpan={8} className="vazio">Nenhum documento com esses filtros.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
