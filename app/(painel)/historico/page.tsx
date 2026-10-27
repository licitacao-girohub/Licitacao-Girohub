import Link from 'next/link';
import { repo } from '@/lib/repo';
import { quandoCurto } from '@/lib/formato';

export const dynamic = 'force-dynamic';

export default async function Historico() {
  const [hist, docs] = await Promise.all([repo().historico({ limite: 500 }), repo().listar()]);
  const nomes = Object.fromEntries(docs.map((d) => [d.id, d.item]));
  return (
    <>
      <div className="topo">
        <div>
          <div className="eyebrow">Trilha de auditoria</div>
          <h1>Histórico</h1>
          <div className="muted">Toda alteração feita pelo sistema fica registrada aqui e na aba “Historico” da planilha.</div>
        </div>
      </div>
      <div className="cartao tabela-wrap">
        {hist.length === 0 ? <div className="vazio">Nenhuma movimentação registrada ainda.</div> : (
          <table>
            <thead><tr><th>Quando</th><th>Quem</th><th>Ação</th><th>Documento</th><th>Detalhe</th></tr></thead>
            <tbody>{hist.map((e, i) => (
              <tr key={i}>
                <td style={{ whiteSpace: 'nowrap' }} className="muted">{quandoCurto(e.quando)}</td>
                <td>{e.usuario}</td>
                <td>{e.acao}</td>
                <td><Link href={`/documentos/${e.documento_id}`}>{e.documento_id}</Link> <span className="muted small">{nomes[e.documento_id] ?? ''}</span></td>
                <td className="muted">{e.detalhe}</td>
              </tr>))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
