import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.js',
      userscript: {
        icon: 'https://vitejs.dev/logo.svg',
        match: ['https://juejin.cn/book/*',
          'https://juejin.cn/video/*'],
        author: 'c0dedance',
        "run-at": "document-start",
        name: "juejin-book-exporter",
        namespace: "http://tampermonkey.net/",
        version: "0.0.1",
        description: "export juejin book",
        license: "MIT"
      },
    }),
  ],
  build: {
    minify: true
  }
});
