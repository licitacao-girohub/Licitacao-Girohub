'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tamanhoLegivel } from '@/lib/formato';

const LIMITE = 25 * 1024 * 1024;

interface Props {
  docId: string;
  atual: { id: string; nome: string; link: string } | null;
  pasta: string;
  temModelo: boolean;
}

async function postar(url: string, corpo: unknown) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.erro || `Falha (${r.status}).`);
  return j;
}

function enviarComProgresso(url: string, arquivo: File, aoProgredir: (p: number) => void): Promise<{ id?: string }> {
  return new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open('PUT', url);
    x.setRequestHeader('Content-Type', arquivo.type || 'application/octet-stream');
    x.upload.onprogress = (e) => { if (e.lengthComputable) aoProgredir(Math.round((e.loaded / e.total) * 100)); };
    x.onload = () => {
      if (x.status >= 200 && x.status < 300) { try { resolve(JSON.parse(x.responseText)); } catch { resolve({}); } }
      else reject(new Error(`O envio falhou (${x.status}).`));
    };
    // Se o Google não liberar a leitura da resposta (CORS), o arquivo pode ter chegado mesmo assim:
    // segue sem id e o servidor localiza o arquivo pelo nome na pasta.
    x.onerror = () => resolve({});
    x.send(arquivo);
  });
}

export default function PainelArquivo({ docId, atual, pasta, temModelo }: Props) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [progresso, setProgresso] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  async function executar(rotulo: string, fn: () => Promise<string | void>) {
    setErro(null); setAviso(null); setOcupado(rotulo);
    try { const msg = await fn(); if (msg) setAviso(msg); router.refresh(); }
    catch (e) { setErro(e instanceof Error ? e.message : String(e)); }
    finally { setOcupado(null); setProgresso(0); setConfirmarExclusao(false); }
  }

  async function enviar(arquivo: File) {
    if (arquivo.size > LIMITE) { setErro(`Arquivo de ${tamanhoLegivel(arquivo.size)}: o limite é 25 MB.`); return; }
    await executar('Enviando', async () => {
      const { url } = await postar('/api/arquivos/sessao', { docId, nome: arquivo.name, mime: arquivo.type, tamanho: arquivo.size });
      const r = await enviarComProgresso(url, arquivo, setProgresso);
      const j = await postar('/api/arquivos/concluir', { docId, fileId: r.id, nome: arquivo.name });
      return j.mensagem;
    });
    if (input.current) input.current.value = '';
  }

  const ehWord = atual && /\.docx$/i.test(atual.nome);

  return (
    <div className="pilha" style={{ gap: 12 }}>
      {atual ? (
        <div className="lado-a-lado" style={{ justifyContent: 'space-between' }}>
          <span>📄 <a href={atual.link} target="_blank" rel="noreferrer">{atual.nome || 'Abrir arquivo'}</a></span>
          <span className="muted small">pasta {pasta}</span>
        </div>
      ) : <div className="muted">Nenhum arquivo anexado. Destino: pasta <b>{pasta}</b> no Drive.</div>}

      <div className="lado-a-lado">
        <input ref={input} type="file" hidden accept=".pdf,.docx,.doc,.xlsx,.xls,.png,.jpg,.jpeg,.zip" onChange={(e) => { const f = e.target.files?.[0]; if (f) void enviar(f); }} />
        <button type="button" className="botao b-pri" disabled={!!ocupado} onClick={() => input.current?.click()}>{atual ? 'Substituir arquivo' : 'Anexar arquivo'}</button>
        {temModelo && (
          <button type="button" className="botao b-sec" disabled={!!ocupado} onClick={() => executar('Gerando Word', async () => (await postar('/api/arquivos/gerar', { docId })).mensagem)}>
            Gerar Word (piloto CRMV-ES)
          </button>
        )}
        {ehWord && (
          <button type="button" className="botao b-sec" disabled={!!ocupado} onClick={() => executar('Gerando PDF', async () => (await postar('/api/arquivos/pdf', { docId })).mensagem)}>
            Gerar PDF desta versão
          </button>
        )}
        {atual && (
          <button type="button" className={`botao b-perigo${confirmarExclusao ? ' confirmar' : ''}`} disabled={!!ocupado}
            onClick={() => (confirmarExclusao ? executar('Excluindo', async () => (await postar('/api/arquivos/excluir', { docId })).mensagem) : setConfirmarExclusao(true))}
            onBlur={() => setConfirmarExclusao(false)}>
            {confirmarExclusao ? 'Confirmar exclusão' : 'Excluir arquivo'}
          </button>
        )}
      </div>

      {ocupado && <div className="small muted" aria-live="polite">{ocupado}…{ocupado === 'Enviando' && <div className="progresso"><span style={{ width: `${progresso}%` }} /></div>}</div>}
      {erro && <div className="aviso erro" role="alert">{erro}</div>}
      {aviso && <div className="aviso ok" role="status">{aviso}</div>}
      {ehWord && <p className="muted small" style={{ margin: 0 }}>Para ajustar: abra o arquivo no Drive (edita como Word), salve e depois clique em “Gerar PDF desta versão”. O PDF fica na mesma pasta e passa a ser o arquivo atual; o Word continua nas versões.</p>}
    </div>
  );
}
