// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      '**/e2e/**',
    ],
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      include: [
        'src/components/**/*.tsx',
        'src/contexts/**/*.tsx',
        'src/hooks/**/*.ts',
        'src/lib/**/*.ts',
      ],
      exclude: [
        // Standard exclusions
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        '**/coverage/**',
        '**/.storybook/**',
        '**/storybook-static/**',
        '**/e2e/**',
        
        // test files
        '**/*.test.ts',
        '**/*.test.tsx',
        
        // Configs
        'vitest.setup.ts',
        'playwright.config.ts',

        // Next.js page and layout files
        'src/app/**/page.tsx',
        'src/app/**/layout.tsx',
        
        // Firebase configuration
        'src/lib/firebase/config.ts',
        'src/lib/firebase/admin.ts',
        
        // Purely presentational components
        'src/components/auth/SignUpIllustration.tsx',
  
        // Type definition files
        '**/*.d.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});