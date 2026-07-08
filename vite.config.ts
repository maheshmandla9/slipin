import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { localApiPlugin } from './vite-plugin-local-api';

export default defineConfig(({ mode }) => {
  // Vite only exposes VITE_-prefixed vars to import.meta.env by design; the
  // local API plugin needs the server secrets (ANTHROPIC_API_KEY, etc.) from
  // .env/.env.local too, so pull everything into process.env for dev only.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return {
    plugins: [react(), tailwindcss(), localApiPlugin()],
  };
});
