/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs",
    "./public/**/*.{html,js}",
    "./src/**/*.{html,js}"
  ],
  theme: {
    extend: {
      colors: {
        discord: {
          blue: '#5865F2',
          'blue-hover': '#4752C4',
          green: '#57F287',
          yellow: '#FEE75C',
          red: '#ED4245',
          'red-hover': '#D73C3F',
          dark: '#36393F',
          darker: '#2F3136',
          darkest: '#202225',
          light: '#DCDDDE',
          muted: '#72767D',
          border: '#42464D',
          'dark-hover': '#40444B',
          'message-hover': '#32353B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'bounce-subtle': 'bounceSubtle 0.6s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.4' },
          '50%': { transform: 'scale(2)', opacity: '0' }
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'discord': '0 8px 16px rgba(0, 0, 0, 0.24)',
        'discord-lg': '0 16px 32px rgba(0, 0, 0, 0.32)',
        'message': '0 1px 3px rgba(0, 0, 0, 0.12)',
        'glow': '0 0 20px rgba(88, 101, 242, 0.3)',
      }
    },
  },
  plugins: [],
}