/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        textPrimary: 'var(--color-text-primary)',
        textMuted: 'var(--color-text-muted)',
        brand: 'var(--color-brand)',
        brandHover: 'var(--color-brand-hover)',
        accent: 'var(--color-accent)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
