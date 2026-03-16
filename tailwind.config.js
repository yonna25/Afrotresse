/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brown:    '#2C1A0E',
        mid:      '#5C3317',
        warm:     '#8B5E3C',
        gold:     '#C9963A',
        goldLight:'#E8B96A',
        cream:    '#FAF4EC',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body:    ['"Nunito"', 'sans-serif'],
      },
      backgroundImage: {
        'adinkra': "url('/icons/adinkra-pattern.svg')",
      },
      animation: {
        'spin-slow':   'spin 3s linear infinite',
        'pulse-gold':  'pulseGold 2s ease-in-out infinite',
        'slide-up':    'slideUp 0.5s ease-out',
        'fade-in':     'fadeIn 0.4s ease-out',
        'shimmer':     'shimmer 2s linear infinite',
      },
      keyframes: {
        pulseGold: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(201,150,58,0.4)' },
          '50%':     { boxShadow: '0 0 0 16px rgba(201,150,58,0)' },
        },
        slideUp: {
          from: { transform: 'translateY(30px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        }
      }
    }
  },
  plugins: []
}
