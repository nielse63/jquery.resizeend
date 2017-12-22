// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2017,
  },
  env: {
    node: true,
    es6: true,
  },
  extends: [
    'xo/esnext',
    'plugin:flowtype/recommended',
    'prettier',
    'prettier/flowtype',
  ],
  plugins: ['import', 'flowtype', 'prettier'],
  rules: {
    'func-names': ['error', 'always'],
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'all',
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['__tests__/**/*.js', 'test/**/*.js', 'scripts/**/*.js', 'webpack.config.js'] },
    ],
  },
};
