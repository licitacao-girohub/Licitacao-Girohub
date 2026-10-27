import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const manrope = localFont({
  src: [
    { path: './fonts/Manrope_400Regular.ttf', weight: '400' },
    { path: './fonts/Manrope_600SemiBold.ttf', weight: '600' },
    { path: './fonts/Manrope_700Bold.ttf', weight: '700' },
    { path: './fonts/Manrope_800ExtraBold.ttf', weight: '800' },
  ],
  variable: '--fonte',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Licitações GiroHub · Checklist mestre',
  description: 'Controle de documentos de habilitação e proposta da GiroHub.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={manrope.variable}>
      <body>{children}</body>
    </html>
  );
}
