import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set the base path to match the deployment URL. 
  // Use '/' if deploying to the root of a domain (e.g., https://example.com/).
  // Use '/sid-en/' if deploying to a subdirectory (e.g., https://example.com/sid-en/).
  base: '/',
})

