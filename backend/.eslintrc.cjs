/**
 * ESLint — backend (plain Node, CommonJS).
 *
 * Same posture as the frontend config: errors only for genuinely broken code,
 * warnings for style, because this codebase had never been linted.
 */
module.exports = {
  root: true,
  env: { node: true, es2022: true },
  extends: ['eslint:recommended'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'script' },
  ignorePatterns: ['node_modules', 'uploads', 'logs'],
  rules: {
    'no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true,
      // Express error middleware must keep its 4-arg shape to be recognised.
      args: 'after-used',
    }],
    'no-empty': 'warn',
    // Cosmetic; not worth a bulk rewrite of regex literals in this pass.
    'no-useless-escape': 'warn',
    'no-extra-semi': 'warn',
    // Seed/migration scripts are CLI tools; console is their output channel.
    'no-console': 'off',
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js', 'tests/**/*.js'],
      env: { node: true },
    },
  ],
};
