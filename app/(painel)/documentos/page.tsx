import { repo } from '@/lib/repo';
import { hojeBR, situacao, statusEfetivo } from '@/lib/model';
import TabelaDocumentos, { type LinhaDoc } from '@/components/TabelaDocumentos';

export const dynamic = 'force-dynamic';

export default async function Documentos({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const hoje = hojeBR();
  const docs = await repo().listar();
  const linhas: LinhaDoc[] = docs.map((d) => {
    const s = situacao(d, hoje);
    return {
      id: d.id, item: d.item, grupo: d.grupo, tipo: d.tipo, status: statusEfetivo(d, s), statusBruto: d.status, responsavel: d.responsavel,
      venceEm: s.venceEm, nivel: s.nivel, rotulo: s.rotulo, dias: s.diasRestantes, temArquivo: Boolean(d.arquivo_id), inconsistente: Boolean(s.inconsistencia),
    };
  });
  return (
    <>
      <div className="topo">
        <div>
          <div className="eyebrow">Checklist mestre</div>
          <h1>Documentos</h1>
          <div className="muted">Clique em um documento para atualizar status, datas e arquivo.</div>
        </div>
      </div>
      <div className="cartao">
        <TabelaDocumentos linhas={linhas} inicial={{ busca: sp.busca ?? '', grupo: sp.grupo ?? '', tipo: sp.tipo ?? '', status: sp.status ?? '', situacao: sp.situacao ?? '' }} />
      </div>
    </>
  );
}
