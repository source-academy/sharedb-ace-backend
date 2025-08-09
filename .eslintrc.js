// @ts-check
/** @type{import('eslint').Linter.LegacyConfig} */
export default {
  root: true,
  extends: ['eslint:recommended'],
  rules: {
    eqeqeq: ['error', 'always']
  },
  parserOptions: { ecmaVersion: 11 },
  env: { es6: true, node: true }
};
