import { exigirUsuario } from '@/lib/auth';
import { modoDemo } from '@/lib/repo';
import { sair } from '../acoes';
import Navegacao from '@/components/Navegacao';

export const dynamic = 'force-dynamic';

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const u = await exigirUsuario();
  return (
    <div className="app">
      <aside className="lateral">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-branco.png" alt="GiroHub" />
        <Navegacao />
        <div className="rodape">
          {modoDemo() && <span className="chip c-aviso" style={{ alignSelf: 'flex-start' }}>Modo demonstração</span>}
          <span>Conectado como <b style={{ color: '#fff' }}>{u.nome}</b></span>
          <form action={sair}><button>Sair</button></form>
        </div>
      </aside>
      <main className="conteudo">{children}</main>
    </div>
  );
}
