import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Bibliotecas do Google rodam só no servidor (Node), sem empacotar.
  serverExternalPackages: ['@googleapis/sheets', '@googleapis/drive', 'google-auth-library'],
  poweredByHeader: false,
  // Esconde o botão flutuante do modo de desenvolvimento (cobria o botão "Sair").
  devIndicators: false,
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'same-origin' },
      ],
    }];
  },
};

export default nextConfig;
