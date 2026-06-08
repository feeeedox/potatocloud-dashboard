import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu(
    {
      ignores: ['prisma/generated/**'],
      formatters: {
        prettier: true,
      },
      rules: {
        'no-alert': 'off',
        'style/semi': 'off',
        'style/eol-last': 'off',
        'vue/singleline-html-element-content-newline': 'off',
        'antfu/consistent-list-newline': 'off',
        'antfu/if-newline': 'off',
        'style/no-trailing-spaces': ['error', { ignoreComments: true }],
        'style/max-statements-per-line': ['error', { max: 2 }],
        'vue/html-self-closing': [
          'error',
          {
            html: {
              void: 'any',
              normal: 'always',
              component: 'always',
            },
            svg: 'always',
            math: 'always',
          },
        ],
      },
    },
    {
      files: ['**/*.md'],
      rules: {
        'style/no-trailing-spaces': 'off',
        'eslint-comments/no-unlimited-disable': 'off',
      },
    },
  ),
)
