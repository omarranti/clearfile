import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, readFileSync } from 'fs'
import { join } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // GitHub Pages serves 404.html for unknown routes; copy index so SPA routing works
    {
      name: 'copy-404-for-spa',
      closeBundle() {
        const outDir = join(__dirname, 'dist')
        copyFileSync(join(outDir, 'index.html'), join(outDir, '404.html'))
      },
    },
    // SPA fallback for `vite preview` - serve index.html for 404s (runs after static)
    {
      name: 'preview-spa-fallback',
      configurePreviewServer(server) {
        const indexHtml = readFileSync(join(__dirname, 'dist', 'index.html'), 'utf-8')
        server.middlewares.use((req, res, next) => {
          const url = req.url?.split('?')[0] ?? ''
          const isAsset = /^\/(assets|branding|media)\//.test(url) || /\.[a-z0-9]+$/i.test(url)
          if (!isAsset && !res.headersSent) {
            res.setHeader('Content-Type', 'text/html')
            res.end(indexHtml)
          } else {
            next()
          }
        })
      },
    },
  ],
  base: '/',
})
