import { defineConfig, loadEnv } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig(({ command, mode }) => {
  if (command === 'serve') {
    const environment = loadEnv(mode, process.cwd(), '')
    for (const name of [
      'AUTH_SESSION_COOKIE_NAME',
      'KEMENAG_AUTH_ORIGIN',
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_DB_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
    ]) {
      if (!process.env[name] && environment[name]) {
        process.env[name] = environment[name]
      }
    }
  }

  return {
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    plugins: [
      tailwindcss(),
      tanstackStart(),
      command === 'build' && nitro(),
      viteReact(),
    ],
  }
})
