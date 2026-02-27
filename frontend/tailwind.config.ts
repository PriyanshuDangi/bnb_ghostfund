import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ghost: {
          50: '#f0fdf9',
          100: '#ccfbef',
          200: '#99f6df',
          300: '#5ceacb',
          400: '#2dd4b3',
          500: '#14b89c',
          600: '#0d9480',
          700: '#0f7668',
          800: '#115e54',
          900: '#134e46',
          950: '#042f2b',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;
