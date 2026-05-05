import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary':   '#04040f',
        'bg-secondary': '#080818',
        'bg-card':      '#0e0e24',
        'bg-hover':     '#13132e',
        'cyan':         '#00d4ff',
        'cyan-dim':     'rgba(0,212,255,0.12)',
        'purple':       '#8b5cf6',
        'purple-dim':   'rgba(139,92,246,0.12)',
        'amber':        '#f59e0b',
        'txt-primary':  '#eeeeff',
        'txt-secondary':'#8888aa',
        'txt-muted':    '#44445a',
        'border-dim':   '#1a1a38',
        'border-glow':  'rgba(0,212,255,0.35)',
      },
      fontFamily: {
        sans:    ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-space)', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      animation: {
        blob:        'blob 9s infinite ease-in-out',
        'ping-slow': 'ping 2s cubic-bezier(0,0,.2,1) infinite',
        gridscroll:  'gridscroll 20s linear infinite',
      },
      keyframes: {
        blob: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%':     { transform: 'translate(30px,-40px) scale(1.08)' },
          '66%':     { transform: 'translate(-20px,20px) scale(0.95)' },
        },
        gridscroll: {
          '0%':   { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '80px 80px' },
        },
      },
    },
  },
  plugins: [],
}

export default config
