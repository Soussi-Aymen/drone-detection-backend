**
 * @type {import("eslint").Linter.Config}
 *
 * This configuration is optimized for a modern Node.js backend (CommonJS structure).
 * It includes base recommended rules, targets ES2022, and enables the Node environment.
 */
module.exports = {
  // Specifies the execution environment. We need 'node' for backend code.
  env: {
    node: true,
    es2022: true, // Enables global variables and parsing features for ES2022
  },
  // Use the standard recommended ESLint rules
  extends: [
    'eslint:recommended'
  ],
  // Parser options to configure how ESLint parses the code
  parserOptions: {
    ecmaVersion: 2022, // Allows for the parsing of modern ECMAScript features
    sourceType: 'script', // Since this is a CommonJS/Node.js project
  },
  // Defines rules to enforce or override
  rules: {
    // General Code Quality & Style
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_|^req|^res|^next' }], // Ignore unused vars starting with _ or common Express params
    'indent': ['error', 2, { 'SwitchCase': 1 }], // Enforce 2-space indentation
    'quotes': ['error', 'single'], // Enforce single quotes
    'semi': ['error', 'always'], // Require semicolons
    'prefer-const': 'error', // Suggest using const for variables that are never reassigned
    'curly': 'error', // Enforce consistent use of curly braces for all control statements

    // Node.js Specific Rules (Optional but recommended)
    'global-require': 'warn', // Discourage inline requires
    'no-console': 'warn', // Treat console logs as warnings, not errors
    'no-return-await': 'error', // Prefer `return x` over `return await x`
    'no-async-promise-executor': 'error', // Prevent using async functions as promise executor

    // Security/Error Prevention
    'eqeqeq': 'error', // Require use of === and !==
    'no-undef': 'error', // Disallow use of undeclared variables
  },
  // Overrides section: Use this to apply different configurations to specific file types (e.g., TypeScript)
  // Example for TypeScript (requires @typescript-eslint/parser and @typescript-eslint/eslint-plugin):
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        // Add TypeScript-specific rule overrides here
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    }
  ]
  */
};