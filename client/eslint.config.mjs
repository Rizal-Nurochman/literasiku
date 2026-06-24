import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      '@stylistic/no-trailing-spaces': 'off',
      '@stylistic/eol-last': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      '@stylistic/indent': 'off',
      '@stylistic/quotes': 'off',
      '@stylistic/semi': 'off',
      '@stylistic/comma-dangle': 'off',
      '@stylistic/no-multiple-empty-lines': 'off',
      '@stylistic/object-curly-spacing': 'off',
      '@stylistic/array-bracket-spacing': 'off',
    }
  }
)