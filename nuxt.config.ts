import process from 'node:process';
import tailwindcss from '@tailwindcss/vite';
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
    optimizeDeps: {
      include: [
        '@iconify/vue',
        '@number-flow/vue',
        '@tanstack/vue-table',
        '@unovis/ts',
        '@unovis/vue',
        '@vee-validate/zod',
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'class-variance-authority',
        'clsx',
        'lucide-vue-next',
        'pinia',
        'reka-ui',
        'tailwind-merge',
        'vaul-vue',
        'vee-validate',
        'vue-sonner',
        'zod',
      ],
    },
  },

  components: [
    {
      path: '~/components',
      extensions: ['.vue'],
    },
  ],

  nuxtQuery: {
    autoImports: ['useQuery', 'useMutation', 'useQueryClient'],
    devtools: true,
  },

  modules: [
    'shadcn-nuxt',
    '@vueuse/nuxt',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@nuxt/fonts',
    '@nuxthub/core',
    'nuxt-auth-utils',
    '@peterbud/nuxt-query',
  ],

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "~/components/ui"
     */
    componentDir: '~/components/ui',
  },

  colorMode: {
    classSuffix: '',
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  fonts: {
    families: [
      {
        name: 'MinecraftFifty-Solid',
        src: '/fonts/minecraftfifty.otf',
        weights: [300, 400, 500, 600, 700, 800, 900],
      },
    ],
    defaults: {
      weights: [300, 400, 500, 600, 700, 800],
    },
  },

  routeRules: {
    '/admin': { redirect: '/admin/members' },
  },

  imports: {
    dirs: [
      './lib',
    ],
  },

  nitro: {
    externals: {
      inline: ['vue'],
    },
    rollupConfig: {
      plugins: [
        {
          name: 'force-vue-named-exports',
          transform(code, id) {
            if (id.includes('.nuxt/dist/server/server.mjs')) {
              return {
                code: code.replace('import require$$0, {', 'import {'),
                map: null,
              };
            }
          },
        },
      ],
    },
  },

  compatibilityDate: '2026-03-13',

  runtimeConfig: {
    cloudToken: process.env.CLOUD_TOKEN ?? '',
    public: {
      wsBaseUrl: process.env.WS_BASE_URL ?? '',
      cloudBaseUrl: process.env.CLOUD_BASE_URL ?? '',
    },
  },

})
