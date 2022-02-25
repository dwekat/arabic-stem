import path from 'path';
import { defineConfig } from 'vite';

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      name: 'arabic-stem',
      // fileName: (format) => `arabic-stemmer.${format}.js` // Custom file name
    },
  },
});
