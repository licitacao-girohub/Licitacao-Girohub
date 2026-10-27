'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITENS = [
  { href: '/', rotulo: 'Painel' },
  { href: '/documentos', rotulo: 'Documentos' },
  { href: '/historico', rotulo: 'Histórico' },
];

export default function Navegacao() {
  const p = usePathname();
  return (
    <nav aria-label="Principal">
      {ITENS.map((i) => {
        const ativo = i.href === '/' ? p === '/' : p.startsWith(i.href);
        return <Link key={i.href} href={i.href} aria-current={ativo ? 'page' : undefined}>{i.rotulo}</Link>;
      })}
    </nav>
  );
}
