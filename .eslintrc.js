// This comment disables the no-undef rule for this line, allowing the use of module.exports
// eslint-disable-next-line no-undef
module.exports = {
  // Specifies the environments where the code is intended to run
  env: {
    // Enables Node.js global variables and Node.js scoping
    node: true,
    // Enables all ECMAScript 2021 globals and automatically sets the ecmaVersion parser option to 12
    es2021: true,
    // Enables browser global variables
    browser: true,
  },

  // Extends the set of rules from eslint:recommended and the React plugin
  extends: [
    'eslint:recommended',
    'plugin:react/recommended'
  ],

  // Specifies the JavaScript language options to be supported
  parserOptions: {
    // Use ECMAScript version 12 (same as 2021)
    ecmaVersion: 12,
    // Use ECMAScript modules
    sourceType: 'module',
    // Additional language features
    ecmaFeatures: {
      // Enable JSX
      jsx: true,
    },
  },

  // List of ESLint plugins to use
  plugins: [
    'react'
  ],

  // ESLint rules configuration
  rules: {
    // Disable the rule requiring React to be in scope when using JSX
    'react/react-in-jsx-scope': 'off',
    // Enable the no-undef rule with typeof checks
    'no-undef': ['error', { typeof: true }],
  },

  // Settings for ESLint plugins
  settings: {
    // React plugin settings
    react: {
      // Automatically detect the React version
      version: 'detect',
    },
  },

  // Global variables
  globals: {
    // Define process as a read-only global variable
    process: 'readonly',
  },
};