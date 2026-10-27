import Link from 'next/link';
import { notFound } from 'next/navigation';
import { repo, arquivos } from '@/lib/repo';
import { formataData, hojeBR, situacao, statusEfetivo } from '@/lib/model';
import { ChipSituacao, ChipStatus, ChipTipo } from '@/components/Chips';
import FormDocumento from '@/components/FormDocumento';
import PainelArquivo from '@/components/PainelArquivo';
import { NUMS_COM_MODELO } from '@/lib/templates/crmv-es.mjs';
import { quandoCurto } from '@/lib/formato';

export const dynamic = 'force-dynamic';

export default async function Detalhe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await repo().obter(id);
  if (!d) notFound();
  const s = situacao(d, hojeBR());
  const hist = await repo().historico({ documentoId: id });
  const versoes = hist.filter((e) => e.arquivo_id);
  const temModelo = NUMS_COM_MODELO.includes(d.num);

  return (
    <>
      <div className="topo">
        <div>
          <div className="eyebrow"><Link href="/documentos">Documentos</Link> · Item {d.id} · {d.grupo}</div>
          <h1 style={{ maxWidth: 820 }}>{d.item}</h1>
          <div className="lado-a-lado" style={{ marginTop: 8 }}>
            <ChipStatus status={statusEfetivo(d, s)} /><ChipSituacao nivel={s.nivel} rotulo={s.rotulo} /><ChipTipo tipo={d.tipo} />
          </div>
        </div>
        {d.link_emissao && <a className="botao b-sec" href={d.link_emissao} target="_blank" rel="noreferrer">Abrir site de emissão ↗</a>}
      </div>

      {s.inconsistencia && <div className="aviso atencao" style={{ marginBottom: 16 }}><b>Atenção:</b> {s.inconsistencia}</div>}

      <div className="grade g-det">
        <div className="pilha">
          <div className="cartao">
            <h2>Atualizar</h2>
            <FormDocumento doc={{ id: d.id, status: d.status, data_emissao: d.data_emissao, validade_dias: d.validade_dias, link_emissao: d.link_emissao, observacao: d.observacao, temArquivo: Boolean(d.arquivo_id) }} venceEm={s.venceEm} />
          </div>
          <div className="cartao">
            <h2>Arquivo de evidência</h2>
            <PainelArquivo
              docId={d.id}
              atual={d.arquivo_id ? { id: d.arquivo_id, nome: d.arquivo_nome, link: d.arquivo_link } : null}
              pasta={d.pasta}
              temModelo={temModelo}
            />
          </div>
        </div>

        <div className="pilha">
          <div className="cartao">
            <h2>Referência</h2>
            <dl className="ficha">
              <dt>Base legal</dt><dd>{d.base_legal || '—'}</dd>
              <dt>Onde obter</dt><dd>{d.onde_obter || '—'}</dd>
              <dt>Validade típica</dt><dd>{d.validade_tipica || '—'}</dd>
              <dt>Responsável</dt><dd>{d.responsavel || '—'}</dd>
              <dt>Recorrência</dt><dd>{d.recorrencia || '—'} <span className="muted small">(editais lidos)</span></dd>
              <dt>Pasta no Drive</dt><dd>{d.pasta}</dd>
              <dt>Vence em</dt><dd>{formataData(s.venceEm)}{s.diasRestantes !== null && <span className="muted"> · {s.diasRestantes} dia(s)</span>}</dd>
              <dt>Atualizado</dt><dd>{d.atualizado_em || '—'} <span className="muted">por {d.atualizado_por || '—'}</span></dd>
            </dl>
            {!d.link_emissao && d.tipo === 'Obter' && <p className="muted small" style={{ marginBottom: 0 }}>Sem atalho de emissão cadastrado. Na primeira emissão, salve o link oficial no campo “Atalho de emissão”.</p>}
          </div>

          {versoes.length > 0 && (
            <div className="cartao">
              <h2>Versões do arquivo</h2>
              <ul className="linha-tempo">{versoes.map((e, i) => (
                <li key={i}><time>{quandoCurto(e.quando)}</time><span>{e.acao}: <a href={arquivos().linkDe(e.arquivo_id)} target="_blank" rel="noreferrer">{e.detalhe || e.arquivo_id}</a> <span className="muted">· {e.usuario}</span></span></li>
              ))}</ul>
              <p className="muted small" style={{ marginBottom: 0 }}>Arquivos substituídos continuam no Drive. Arquivos excluídos vão para a lixeira do Drive por 30 dias.</p>
            </div>
          )}

          <div className="cartao">
            <h2>Histórico do documento</h2>
            {hist.length === 0 ? <div className="vazio">Sem movimentações.</div> : (
              <ul className="linha-tempo">{hist.map((e, i) => (
                <li key={i}><time>{quandoCurto(e.quando)}</time><span><b>{e.usuario}</b> · {e.acao}{e.detalhe && <span className="muted"> — {e.detalhe}</span>}</span></li>
              ))}</ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
