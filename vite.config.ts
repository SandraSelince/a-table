import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main:                  resolve(__dirname, 'index.html'),
        landing:               resolve(__dirname, 'landing.html'),
        login:                 resolve(__dirname, 'login.html'),
        signup:                resolve(__dirname, 'signup.html'),
        'signup-curator':      resolve(__dirname, 'signup-curator.html'),
        'signup-restaurant':   resolve(__dirname, 'signup-restaurant.html'),
        dashboard:             resolve(__dirname, 'dashboard.html'),
        'dashboard-restaurant': resolve(__dirname, 'dashboard-restaurant.html'),
        profile:               resolve(__dirname, 'profile.html'),
        'restaurant-profile':  resolve(__dirname, 'restaurant-profile.html'),
        curators:              resolve(__dirname, 'curators.html'),
        categories:            resolve(__dirname, 'categories.html'),
        'how-it-works':        resolve(__dirname, 'how-it-works.html'),
        about:                 resolve(__dirname, 'about.html'),
        statistiques:          resolve(__dirname, 'statistiques.html'),
        'conditions-utilisation': resolve(__dirname, 'conditions-utilisation.html'),
        'mentions-legales':    resolve(__dirname, 'mentions-legales.html'),
        'politique-confidentialite': resolve(__dirname, 'politique-confidentialite.html'),
      }
    }
  }
})
