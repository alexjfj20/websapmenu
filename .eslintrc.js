module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
  ],
  parserOptions: {
    parser: '@babel/eslint-parser',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // Desactivar reglas específicas que puedan estar causando problemas
    'vue/no-v-model-argument': 'off', 
    'vue/no-multiple-template-root': 'off',
    // Hacer advertencias en lugar de errores para facilitar el desarrollo
    'vue/multi-word-component-names': 'warn',
  },
};
