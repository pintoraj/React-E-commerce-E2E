import tailwindcss from '@tailwindcss/vite';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: { //color palette not fixed commonly, imma go random - also Imma change the project to beige red theme
        primary: '#3B82F6',
        secondary: '#1F2937',
        accent: '#F59E0B',
        neutral: '#F3F4F6',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      keyframes: {
        heroFadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        heroFadeIn: 'heroFadeIn 1.5s ease-out forwards',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [react(),tailwindcss()],
}
