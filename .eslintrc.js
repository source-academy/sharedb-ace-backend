module.exports = {
  root: true,
  extends: ['eslint:recommended'],
  rules: {
    eqeqeq: ['error', 'always']
  },
  parserOptions: { ecmaVersion: 11 },
  env: { es6: true, node: true }
};
