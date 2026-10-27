'use client';

import { useActionState } from 'react';
import { entrar } from '../acoes';

export default function FormLogin() {
  const [estado, acao, enviando] = useActionState(entrar, undefined);
  return (
    <form action={acao} className="pilha" style={{ gap: 12 }}>
      <label>Usuário<input key={estado?.usuario ?? ''} name="usuario" autoComplete="username" required autoFocus={!estado?.usuario} defaultValue={estado?.usuario ?? ''} /></label>
      <label>Senha<input name="senha" type="password" autoComplete="current-password" required autoFocus={Boolean(estado?.usuario)} /></label>
      {estado?.erro && <div className="aviso erro" role="alert">{estado.erro}</div>}
      <button className="botao b-pri" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
    </form>
  );
}
