/**
 * ESLint — frontend (React + Vite).
 *
 * eslintrc rather than flat config: ESLint 8.57 only honours flat config when
 * ESLINT_USE_FLAT_CONFIG=true is set, which fails silently if forgotten, and
 * the lint script's --ext flag is eslintrc-only.
 *
 * This codebase had never been linted, so stylistic rules are set to 'warn'
 * deliberately — errors are reserved for things that are actually broken
 * (undefined references, unused bindings) so the signal is not buried.
 */
module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: { react: { version: 'detect' } },
  plugins: ['react-refresh'],
  ignorePatterns: ['dist', 'dev-dist', 'node_modules', '*.config.js', '*.config.cjs'],
  rules: {
    // Genuinely broken code — keep as errors.
    'no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true,
    }],

    // Noise on an unlinted codebase — visible, but not blocking.
    'react/prop-types': 'off',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'no-empty': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    // 23 occurrences, purely cosmetic (apostrophes in copy). Fixing them all
    // would be a bulk reformat that buries substantive changes in diff noise.
    'react/no-unescaped-entities': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
  },
  overrides: [
    {
      // Service worker / PWA files run in a worker scope.
      files: ['src/**/sw.js', 'src/**/service-worker.js'],
      env: { serviceworker: true },
    },
  ],
};
