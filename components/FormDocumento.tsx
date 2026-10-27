'use client';

import { useActionState, useEffect, useState } from 'react';
import { salvarDocumento } from '@/app/acoes';
import { STATUS, formataData, somaDias } from '@/lib/model';

interface Props {
  doc: { id: string; status: string; data_emissao: string; validade_dias: number | ''; link_emissao: string; observacao: string; temArquivo: boolean };
  venceEm: string | null;
}

export default function FormDocumento({ doc }: Props) {
  const [estado, acao, salvando] = useActionState(salvarDocumento, undefined);
  const [data, setData] = useState(doc.data_emissao);
  const [dias, setDias] = useState(doc.validade_dias === '' ? '' : String(doc.validade_dias));
  const [salvo, setSalvo] = useState(false);
  useEffect(() => { if (estado?.ok) { setSalvo(true); const t = setTimeout(() => setSalvo(false), 2500); return () => clearTimeout(t); } }, [estado]);
  const previa = data && dias && Number(dias) > 0 ? somaDias(data, Number(dias)) : null;

  return (
    <form action={acao} className="pilha" style={{ gap: 14 }}>
      <input type="hidden" name="id" value={doc.id} />
      <div className="campos">
        <label>Status
          <select name="status" defaultValue={doc.status}>
            {STATUS.map((s) => <option key={s} value={s} disabled={s === 'Validado' && !doc.temArquivo}>{s}{s === 'Validado' && !doc.temArquivo ? ' (anexe o arquivo antes)' : ''}</option>)}
          </select>
        </label>
        <label>Data de emissão
          <input type="date" name="data_emissao" value={data} onChange={(e) => setData(e.target.value)} />
        </label>
        <label>Validade (dias)
          <input type="number" name="validade_dias" min={1} max={3650} value={dias} onChange={(e) => setDias(e.target.value)} placeholder="Ex.: 180" />
        </label>
        <label>Vence em
          <input value={previa ? formataData(previa) : '—'} readOnly tabIndex={-1} style={{ background: 'var(--fundo)' }} />
        </label>
        <label className="inteiro">Atalho de emissão (link oficial)
          <input name="link_emissao" type="url" defaultValue={doc.link_emissao} placeholder="https://" />
        </label>
        <label className="inteiro">Observação
          <textarea name="observacao" defaultValue={doc.observacao} />
        </label>
      </div>
      <p className="muted small" style={{ margin: 0 }}>Use a data impressa no documento e o prazo de validade que ele traz. Se o edital fixar outro prazo, vale o do edital.</p>
      {estado?.erro && <div className="aviso erro" role="alert">{estado.erro}</div>}
      <div className="lado-a-lado">
        <button className="botao b-pri" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</button>
        {salvo && <span className="chip c-bom">Salvo</span>}
      </div>
    </form>
  );
}
