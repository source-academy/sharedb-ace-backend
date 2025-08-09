// @ts-check
/** @type{import('eslint').Linter.LegacyConfig} */
module.exports = {
  root: true,
  extends: ['eslint:recommended'],
  rules: {
    eqeqeq: ['error', 'always']
  },
  parserOptions: { ecmaVersion: 11, sourceType: 'module' },
  env: { es6: true, node: true }
};
