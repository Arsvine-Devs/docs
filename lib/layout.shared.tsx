import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'Arsvine Docs',
    },
    links: [
      { text: '指南', url: '/guide' },
      { text: 'Reference', url: '/reference' },
      { text: '内部', url: '/internal' },
    ],
  };
}
