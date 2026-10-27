'use client';

export default function Erro({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="cartao pilha" style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 20 }}>Não foi possível carregar os dados</h1>
      <p className="muted" style={{ margin: 0 }}>A planilha ou o Drive do Google não responderam. Se persistir, confira as variáveis de ambiente do Google na Vercel.</p>
      {error.digest && <code className="small muted">Código: {error.digest}</code>}
      <div><button className="botao b-pri" onClick={reset}>Tentar de novo</button></div>
    </div>
  );
}
