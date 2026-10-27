import type { Indicador } from '@/lib/model';

export function Medidor({ ind, href }: { ind: Indicador; href?: string }) {
  const pct = ind.pct ?? 0;
  const dica = ind.total ? `${ind.conformes} de ${ind.total} documentos conformes (validados e no prazo)` : 'Nenhum documento aplicável';
  const nome = href ? <a href={href} style={{ color: 'inherit' }}>{ind.nome}</a> : ind.nome;
  return (
    <div className="medidor" title={dica}>
      <span className="nome">{nome}</span>
      <div className="trilho" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={`${ind.nome}: ${dica}`}>
        <span style={{ width: `${Math.max(pct, pct > 0 ? 2 : 0)}%` }} />
      </div>
      <span className="num"><b>{ind.pct === null ? '—' : `${ind.pct.toLocaleString('pt-BR')}%`}</b> <span className="muted small">{ind.conformes}/{ind.total}</span></span>
    </div>
  );
}
