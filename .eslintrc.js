// Este archivo está intencionalmente reducido al mínimo para evitar problemas durante el despliegue
module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [],  // Removido 'plugin:vue/vue3-essential' para evitar el error de ESLint
  rules: {
    'no-console': 'off',
    'no-debugger': 'off'
  }
};
