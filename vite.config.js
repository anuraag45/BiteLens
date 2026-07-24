import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        features: resolve(__dirname, 'features.html'),
        howItWorks: resolve(__dirname, 'how-it-works.html'),
        bmiCalculator: resolve(__dirname, 'bmi-calculator.html'),
        calorieCalculator: resolve(__dirname, 'calorie-calculator.html'),
        additiveDecoder: resolve(__dirname, 'additive-decoder.html'),
        scannerDemo: resolve(__dirname, 'scanner-demo.html'),
        snackBudget: resolve(__dirname, 'snack-budget.html'),
        science: resolve(__dirname, 'science.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html'),
        faq: resolve(__dirname, 'faq.html'),
        login: resolve(__dirname, 'login.html'),
        signup: resolve(__dirname, 'signup.html'),
      },
    },
  },
});
