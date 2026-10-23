import { defineConfig } from 'vite';
export default defineConfig({ server: { fs: { deny: ['.env', '.env.*', '**/.git/**', '**/context/**', '**/reference/**', '**/*.pem', '**/*.key'] } } });
