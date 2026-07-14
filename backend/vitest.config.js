import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: ['**/node_modules/**', '**/dist/**', '**/cypress/**'],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'reports/**',
        'src/config/**',
        'coverage/**',
        '**/*.config.js',
        'server.js',
        'tests/**',
        'testsContainers/**',
        'testLoad/**'
      ]
    }
  }
});
