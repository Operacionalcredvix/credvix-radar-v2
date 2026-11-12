import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// O manifesto e o JS usam exatamente o mesmo identificador do build publicado.
const buildId = process.env.GITHUB_SHA && process.env.GITHUB_RUN_ID
  ? `${process.env.GITHUB_SHA}-${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT || '1'}`
  : 'local-dev'

export default defineConfig({
  base: '/credvix-radar-v2/',
  define: {
    __RADAR_BUILD_ID__: JSON.stringify(buildId),
  },
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'radar-published-build-manifest',
      apply: 'build',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'version.json',
          source: JSON.stringify({ buildId }) + '\n',
        })
      },
    },
  ],
})
