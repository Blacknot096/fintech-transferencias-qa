const js = require('@eslint/js');
const globals = require('globals');
const jest = require('eslint-plugin-jest');
const prettier = require('eslint-config-prettier');

module.exports = [
  { ignores: ['node_modules/', 'coverage/', 'documentacion/'] },

  js.configs.recommended,

  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      // Errores probables
      eqeqeq: ['error', 'always'],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-implicit-coercion': 'error',
      'no-param-reassign': 'error',
      'no-shadow': 'error',
      'consistent-return': 'error',

      // Estilo y mantenibilidad
      'no-var': 'error',
      'prefer-const': 'error',
      complexity: ['error', 10],
      'max-depth': ['error', 3],
      'max-params': ['error', 4],
    },
  },

  {
    // El código de producción no debe escribir en consola
    files: ['src/**/*.js'],
    rules: { 'no-console': 'error' },
  },

  {
    files: ['pruebas/**/*.js'],
    ...jest.configs['flat/recommended'],
    rules: {
      ...jest.configs['flat/recommended'].rules,
      'jest/no-focused-tests': 'error',
      'jest/no-disabled-tests': 'error',
      'jest/expect-expect': 'error',
    },
  },

  // Desactiva las reglas de formato que resuelve Prettier
  prettier,

  // Va después de Prettier porque su configuración apaga esta regla
  { rules: { curly: ['error', 'all'] } },
];
