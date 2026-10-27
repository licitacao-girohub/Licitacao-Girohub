import type { NivelAlerta } from '@/lib/model';

// Cor de status nunca vem sozinha: sempre ícone + texto.
const Ic = {
  ok: <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.2 5 8.6l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  x: <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 3l6 6M9 3 3 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  relogio: <svg viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M6 3.4V6l1.8 1.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>,
  alerta: <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1.6 11 10.4H1z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="M6 5v2.4M6 8.9v.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>,
  circulo: <svg viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="4.4" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>,
  meio: <svg viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="4.4" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M6 1.6a4.4 4.4 0 0 1 0 8.8z" fill="currentColor" /></svg>,
  doc: <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.5h4l2 2v7H3z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><path d="M4.5 6h3M4.5 8h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>,
  traco: <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 6h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
};

const STATUS_VISUAL: Record<string, [string, JSX.Element]> = {
  'Validado': ['c-bom', Ic.ok],
  'Em verificação': ['c-aviso', Ic.meio],
  'Modelo pronto': ['c-azul', Ic.doc],
  'Pendente': ['c-neutro', Ic.circulo],
  'Não comprovado': ['c-critico', Ic.x],
  'Não se aplica': ['c-mudo', Ic.traco],
  'Vencido': ['c-critico', Ic.alerta],
};

export function ChipStatus({ status }: { status: string }) {
  const [cls, icone] = STATUS_VISUAL[status] ?? ['c-neutro', Ic.circulo];
  return <span className={`chip ${cls}`}>{icone}{status}</span>;
}

const NIVEL_VISUAL: Record<NivelAlerta, [string, JSX.Element]> = {
  vencido: ['c-critico', Ic.alerta],
  hoje: ['c-critico', Ic.alerta],
  critico: ['c-serio', Ic.relogio],
  atencao: ['c-aviso', Ic.relogio],
  renovar: ['c-aviso', Ic.relogio],
  ok: ['c-bom', Ic.ok],
  sem_prazo: ['c-mudo', Ic.traco],
  sem_data: ['c-neutro', Ic.circulo],
};

export function ChipSituacao({ nivel, rotulo }: { nivel: NivelAlerta; rotulo: string }) {
  const [cls, icone] = NIVEL_VISUAL[nivel];
  return <span className={`chip ${cls}`}>{icone}{rotulo}</span>;
}

export function ChipTipo({ tipo }: { tipo: string }) {
  return <span className="chip c-mudo">{tipo}</span>;
}
