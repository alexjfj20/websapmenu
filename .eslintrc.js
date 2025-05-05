// Este archivo está intencionalmente reducido al mínimo para evitar problemas durante el despliegue
module.exports = {
  root: true,
  env: {
    node: true,
    'vue/setup-compiler-macros': true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended' // Handles .vue file parsing
  ],
  parserOptions: {
    parser: '@babel/eslint-parser', // For <script> section
    requireConfigFile: false,
    ecmaVersion: 2021 // Supports ES6+
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // Add custom rules if needed
  }
};
