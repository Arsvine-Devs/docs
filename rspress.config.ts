import { defineConfig } from 'rspress/config';

export default defineConfig({
  root: 'docs',
  title: 'ARSVINE REALM',
  description: 'Documentation for ARSVINE REALM — a post-apocalyptic HUD-themed portfolio & blog site.',
  icon: '/favicon.ico',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Architecture', link: '/guide/architecture' },
      { text: 'Development', link: '/guide/development' },
      { text: 'Operations', link: '/guide/operations' },
      { text: 'Gotchas', link: '/guide/gotchas' },
    ],
    sidebar: {
      '/': [
        { text: 'Home', link: '/' },
        {
          text: 'Guide',
          items: [
            { text: 'Architecture', link: '/guide/architecture' },
            { text: 'Development Guide', link: '/guide/development' },
            { text: 'Operations Guide', link: '/guide/operations' },
            { text: 'Gotchas', link: '/guide/gotchas' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', mode: 'link', content: 'https://github.com/ArsvineZhu/arsvine-realm' },
    ],
    footer: {
      message: 'Source code: MIT License · Content: CC BY-NC-ND 4.0',
    },
  },
});
