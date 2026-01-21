import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  optimizeDeps: {
    include: [
      'zone.js',        // necessário para Angular
      'chart.js/auto'   // necessário para PrimeNG Charts
    ]
  },
  resolve: {
    alias: {
      // garante que imports de Angular funcionem corretamente
      '@angular/core': require.resolve('@angular/core')
    }
  }
});
