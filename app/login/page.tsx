import { redirect } from 'next/navigation';
import { usuarioAtual } from '@/lib/auth';
import FormLogin from './FormLogin';

export const dynamic = 'force-dynamic';

export default async function Login() {
  if (await usuarioAtual()) redirect('/');
  return (
    <main className="login">
      <div className="caixa">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.png" alt="GiroHub" />
        <div>
          <div className="eyebrow">Licitações</div>
          <h1 style={{ fontSize: 20, marginTop: 4 }}>Checklist mestre de documentos</h1>
        </div>
        <FormLogin />
      </div>
    </main>
  );
}
