import Link from 'next/link';
import { repo, arquivos } from '@/lib/repo';
import { alertas, conformidade, formataData, hojeBR, situacao } from '@/lib/model';
import { Medidor } from '@/components/Medidor';
import { ChipSituacao, ChipStatus } from '@/components/Chips';
import { quandoCurto } from '@/lib/formato';

export const dynamic = 'force-dynamic';

export default async function Painel() {
  const hoje = hojeBR();
  const [docs, hist] = await Promise.all([repo().listar(), repo().historico({ limite: 8 })]);
  const c = conformidade(docs, hoje);
  const al = alertas(docs, hoje);
  const sits = docs.map((d) => ({ d, s: situacao(d, hoje) }));
  const vencidos = al.filter((a) => a.s.nivel === 'vencido').length;
  const em30 = al.length - vencidos;
  const semData = sits.filter(({ d, s }) => s.nivel === 'sem_data' && d.status !== 'Não se aplica').length;
  const incons = sits.filter(({ s }) => s.inconsistencia);
  const nomes = Object.fromEntries(docs.map((d) => [d.id, d.item]));
  const planilha = repo().linkPlanilha();
  const pasta = arquivos().pastaRaizLink();

  return (
    <>
      <div className="topo">
        <div>
          <div className="eyebrow">Checklist mestre · Organização</div>
          <h1>Painel de conformidade</h1>
          <div className="muted">Hoje, {formataData(hoje)} · {docs.length} documentos controlados</div>
        </div>
        <div className="acoes">
          {planilha && <a className="botao b-sec" href={planilha} target="_blank" rel="noreferrer">Abrir planilha</a>}
          {pasta && <a className="botao b-sec" href={pasta} target="_blank" rel="noreferrer">Abrir pasta no Drive</a>}
          <Link className="botao b-pri" href="/documentos">Ver documentos</Link>
        </div>
      </div>

      <section className="grade g-kpi" aria-label="Indicadores">
        <div className="cartao kpi">
          <span className="rotulo">Conformidade geral</span>
          <span className="valor grande">{c.geral.pct === null ? '—' : `${c.geral.pct.toLocaleString('pt-BR')}%`}</span>
          <span className="nota">{c.geral.conformes} de {c.geral.total} validados e no prazo (exclui “Não se aplica”)</span>
        </div>
        <Link href="/documentos?situacao=vencido" className="cartao kpi" style={{ textDecoration: 'none' }}>
          <span className="rotulo">Vencidos</span><span className="valor" style={{ color: vencidos ? 'var(--critico)' : undefined }}>{vencidos}</span><span className="nota">renovar já</span>
        </Link>
        <Link href="/documentos?situacao=alerta" className="cartao kpi" style={{ textDecoration: 'none' }}>
          <span className="rotulo">Vencem em até 30 dias</span><span className="valor">{em30}</span><span className="nota">alertas por e-mail em 30, 15, 7, 1 e 0 dia</span>
        </Link>
        <Link href="/documentos?situacao=sem_data" className="cartao kpi" style={{ textDecoration: 'none' }}>
          <span className="rotulo">Com validade e sem data</span><span className="valor">{semData}</span><span className="nota">sem data não há controle de vencimento</span>
        </Link>
        <div className="cartao kpi">
          <span className="rotulo">Inconsistências</span><span className="valor" style={{ color: incons.length ? 'var(--serio)' : undefined }}>{incons.length}</span><span className="nota">status que não bate com a evidência</span>
        </div>
      </section>

      <section className="grade g2" style={{ marginTop: 16 }}>
        <div className="cartao">
          <h2>Conformidade por grupo</h2>
          {c.porGrupo.map((g) => <Medidor key={g.nome} ind={g} href={`/documentos?grupo=${encodeURIComponent(g.nome)}`} />)}
        </div>
        <div className="pilha">
          <div className="cartao">
            <h2>Conformidade por tipo</h2>
            {c.porTipo.map((t) => <Medidor key={t.nome} ind={t} href={`/documentos?tipo=${t.nome}`} />)}
          </div>
          <div className="cartao">
            <h2>Documentos por status</h2>
            <div className="lado-a-lado">
              {c.porStatus.map((s) => (
                <Link key={s.status} href={`/documentos?status=${encodeURIComponent(s.status)}`} style={{ textDecoration: 'none' }}>
                  <ChipStatus status={`${s.status}`} /> <b style={{ color: 'var(--tinta)', marginRight: 10 }}>{s.qtd}</b>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grade g2" style={{ marginTop: 16 }}>
        <div className="cartao">
          <h2>Alertas de vencimento</h2>
          {al.length === 0 ? <div className="vazio">Nenhum documento vencido ou vencendo nos próximos 30 dias.</div> : (
            <div className="tabela-wrap"><table>
              <thead><tr><th>#</th><th>Documento</th><th>Vence em</th><th>Situação</th><th>Responsável</th></tr></thead>
              <tbody>{al.map(({ doc, s }) => (
                <tr key={doc.id}>
                  <td className="id">{doc.id}</td>
                  <td className="item"><Link href={`/documentos/${doc.id}`}>{doc.item}</Link></td>
                  <td>{formataData(s.venceEm)}</td>
                  <td><ChipSituacao nivel={s.nivel} rotulo={s.rotulo} /></td>
                  <td className="muted">{doc.responsavel}</td>
                </tr>))}
              </tbody>
            </table></div>
          )}
          {incons.length > 0 && (
            <div className="aviso atencao" style={{ marginTop: 12 }}>
              <b>Inconsistências:</b>
              <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                {incons.map(({ d, s }) => <li key={d.id}><Link href={`/documentos/${d.id}`}>{d.id} · {d.item}</Link>: {s.inconsistencia}</li>)}
              </ul>
            </div>
          )}
        </div>
        <div className="cartao">
          <div className="lado-a-lado" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
            <h2>Últimas movimentações</h2><Link href="/historico" className="small">ver tudo</Link>
          </div>
          {hist.length === 0 ? <div className="vazio">Nenhuma movimentação registrada ainda.</div> : (
            <ul className="linha-tempo">{hist.map((e, i) => (
              <li key={i}>
                <time>{quandoCurto(e.quando)}</time>
                <span><b>{e.usuario}</b> · {e.acao} <Link href={`/documentos/${e.documento_id}`}>{e.documento_id}</Link> <span className="muted">{nomes[e.documento_id] ?? ''}</span>{e.detalhe && <><br /><span className="muted small">{e.detalhe}</span></>}</span>
              </li>))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
