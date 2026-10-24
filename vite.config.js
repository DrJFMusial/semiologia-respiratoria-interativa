import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Dois alvos de build:
//  npm run build          -> dist/          site estático para o GitHub Pages
//  npm run build:offline  -> dist-offline/  um único index.html autocontido,
//                                           que abre com duplo clique, sem internet
// base './': caminhos relativos; funciona em qualquer subdiretório
// (https://usuario.github.io/repositorio/).
export default defineConfig(({ mode }) => {
  const offline = mode === 'offline';
  return {
    base: './',
    plugins: offline ? [viteSingleFile({ removeViteModuleLoader: true })] : [],
    build: {
      outDir: offline ? 'dist-offline' : 'dist',
      assetsInlineLimit: offline ? 100000000 : 0,
      chunkSizeWarningLimit: 900,
    },
  };
});
