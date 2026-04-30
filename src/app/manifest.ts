import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'aimlock.sensi',
    short_name: 'aimlock',
    description: 'aimlock.sensi - PRECISÃO, VELOCIDADE E CONTROLE TOTAL',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d0404',
    theme_color: '#0d0404',
    icons: [
      {
        src: 'https://i.ibb.co/YBXPmGmq/download.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://i.ibb.co/YBXPmGmq/download.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    scope: '/',
  };
}
