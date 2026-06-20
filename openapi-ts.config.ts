import { defineConfig } from '@hey-api/openapi-ts';
import { loadEnv } from 'vite';

// eslint-disable-next-line node/prefer-global/process
const { OPENAPI_ENDPOINT } = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

export default defineConfig({
  input: OPENAPI_ENDPOINT || '',
  output: {
    path: 'app/client/generated',
  },
  plugins: [
    {
      name: '@hey-api/client-nuxt',
      runtimeConfigPath: './app/hey-api.ts',
    },
    '@hey-api/typescript',
    '@hey-api/sdk',
    '@tanstack/vue-query',
    'zod',
  ],
});
