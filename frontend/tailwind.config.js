/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Wellness-focused color palette
        wellness: {
          50: '#f0f9ff',   // Light sky blue
          100: '#e0f2fe',  // Soft blue
          200: '#bae6fd',  // Pastel blue
          300: '#7dd3fc',  // Medium blue
          400: '#38bdf8',  // Vibrant blue
          500: '#0ea5e9',  // Primary blue
          600: '#0284c7',  // Dark blue
          700: '#0369a1',  // Deeper blue
          800: '#075985',  // Deep blue
          900: '#0c4a6e',  // Darkest blue
        },
        calm: {
          50: '#f0fdf4',   // Light mint
          100: '#dcfce7',  // Soft green
          200: '#bbf7d0',  // Pastel green
          300: '#86efac',  // Medium green
          400: '#4ade80',  // Vibrant green
          500: '#22c55e',  // Primary green
          600: '#16a34a',  // Dark green
          700: '#15803d',  // Deeper green
          800: '#166534',  // Forest green
          900: '#14532d',  // Deep forest
        },
        gentle: {
          50: '#fefce8',   // Light yellow
          100: '#fef3c7',  // Soft yellow
          200: '#fde68a',  // Pastel yellow
          300: '#fcd34d',  // Medium yellow
          400: '#fbbf24',  // Vibrant yellow
          500: '#f59e0b',  // Primary yellow
          600: '#d97706',  // Dark yellow
          700: '#b45309',  // Deeper yellow
          800: '#92400e',  // Deep yellow
          900: '#78350f',  // Darkest yellow
        },
        soft: {
          50: '#fdf2f8',   // Light pink
          100: '#fce7f3',  // Soft pink
          200: '#fbcfe8',  // Pastel pink
          300: '#f9a8d4',  // Medium pink
          400: '#f472b6',  // Vibrant pink
          500: '#ec4899',  // Primary pink
          600: '#db2777',  // Dark pink
          700: '#be185d',  // Deeper pink
          800: '#9d174d',  // Deep pink
          900: '#831843',  // Darkest pink
        },
        // Status colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        'health': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'gentle': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'wellness': '0 10px 25px -5px rgba(14, 165, 233, 0.1), 0 10px 10px -5px rgba(14, 165, 233, 0.04)',
        'calm': '0 10px 25px -5px rgba(34, 197, 94, 0.1), 0 10px 10px -5px rgba(34, 197, 94, 0.04)',
        'soft-pink': '0 10px 25px -5px rgba(236, 72, 153, 0.1), 0 10px 10px -5px rgba(236, 72, 153, 0.04)',
        'gentle-yellow': '0 10px 25px -5px rgba(245, 158, 11, 0.1), 0 10px 10px -5px rgba(245, 158, 11, 0.04)',
      },
    },
  },
  plugins: [],
}
