// eslint-disable-next-line no-undef
module.exports = {
    env: {
      node: true,
      es2021: true,
      browser: true,
    },
    extends: ['eslint:recommended', 'plugin:react/recommended'],
    parserOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    plugins: ['react'],
    rules: {
      'react/react-in-jsx-scope': 'off',
      'no-undef': ['error', { typeof: true }],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    globals: {
      process: true,
    },
  };