module.exports = {
  test: {
    globals: true,
    environment: 'node',
    root: 'src',
    include: ['**/*.spec.ts'],
    coverage: {
      include: ['**/*.ts'],
      exclude: ['**/*.spec.ts'],
      reportsDirectory: '../coverage',
    },
  },
};
