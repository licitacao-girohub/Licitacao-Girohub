import Link from 'next/link';

export default function NaoEncontrado() {
  return (
    <div className="cartao pilha" style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: 20 }}>Documento não encontrado</h1>
      <Link className="botao b-sec" href="/documentos">Voltar para documentos</Link>
    </div>
  );
}
