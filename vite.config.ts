import { defineConfig } from 'vite'

const base = process.env.VITE_BASE?.trim() || '/tttt/'

export default defineConfig({
  base,
})
