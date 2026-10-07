module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/pruebas'],
  collectCoverageFrom: ['src/**/*.js', 'herramientas/pairwise.js'],
  coverageThreshold: {
    global: { statements: 90, branches: 90, functions: 90, lines: 90 },
  },
};
