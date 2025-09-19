import tailwindcss from '@tailwindcss/vite';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Define a cohesive color palette
      colors: {
        primary: '#3B82F6', // Blue
        secondary: '#1F2937', // Dark Gray
        accent: '#F59E0B', // Amber/Yellow
        neutral: '#F3F4F6', // Light Gray
      },
      // Set the default font
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      // Define custom keyframe animations
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
      // Make animations available as utility classes
      animation: {
        heroFadeIn: 'heroFadeIn 1.5s ease-out forwards',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [react(),tailwindcss()],
}