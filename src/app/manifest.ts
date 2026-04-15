import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GSF-Portfolio',
    short_name: 'GSF',
    description: 'GSF Asset Portfolio Tracker',
    start_url: '/',
    display: 'standalone',
    background_color: '#f2f4f6',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/apple-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
