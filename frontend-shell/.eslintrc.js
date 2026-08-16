/**
 * ESLint configuration for frontend-shell.
 *
 * The Design System guard `no-emoji` lives in
 * `.eslint-plugin/eslint-plugin-local/` and is installed as a
 * file: dependency (see `package.json`). The rule is referenced
 * as `local/no-emoji` per the standard `eslint-plugin-*` convention.
 */
module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  plugins: ['local'],
  rules: {
    'local/no-emoji': 'error',
  },
};
