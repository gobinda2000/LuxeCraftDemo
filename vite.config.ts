import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {reactRouter} from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({command, isSsrBuild}) => ({
  plugins: [
    tailwindcss(),
    hydrogen(),
    // Keep the original Oxygen emulator for `npm run dev` only. Production
    // builds omit it and are handled by Vercel's React Router preset.
    ...(command === 'serve' ? [oxygen()] : []),
    reactRouter(),
  ],
  resolve: {
    alias: {
      // Vite's native tsconfig path resolver does not cover JavaScript
      // projects that use jsconfig.json, so define Hydrogen's app alias here.
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      // MiniOxygen uses Web Streams; Vercel uses the package's Node stream
      // entry during production builds.
      ...(command === 'serve'
        ? {
            '@vercel/react-router/entry.server': fileURLToPath(
              new URL('./app/lib/vercel-entry.server.local.tsx', import.meta.url),
            ),
          }
        : {}),
    },
    tsconfigPaths: true,
  },
  build: {
    // Vercel invokes this Fetch-compatible server entry for every SSR request.
    rollupOptions: isSsrBuild ? {input: './server.ts'} : undefined,
    // Allow a strict Content-Security-Policy
    // without inlining assets as base64:
    assetsInlineLimit: 0,
  },
  ssr: {
    optimizeDeps: {
      /**
       * Include dependencies here if they throw CJS<>ESM errors.
       * For example, for the following error:
       *
       * > ReferenceError: module is not defined
       * >   at /Users/.../node_modules/example-dep/index.js:1:1
       *
       * Include 'example-dep' in the array below.
       * @see https://vitejs.dev/config/dep-optimization-options
       */
      include: [
        '@vercel/functions',
        'react-router > set-cookie-parser',
        'react-router > cookie',
        'react-router',
      ],
    },
  },
  server: {
    allowedHosts: ['.tryhydrogen.dev'],
  },
}));
