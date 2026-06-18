import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'http://localhost:8080/openapi',
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
  ],
});
