import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: { DEFAULT: '#C41E3A', light: '#E8354F', dark: '#9B1530' },
                secondary: { DEFAULT: '#E87D2B', dark: '#C5621A' },
                brand: {
                    red: '#C41E3A',
                    orange: '#E87D2B',
                    gold: '#FFD700',
                },
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
                brand: ['var(--font-baloo)', 'Inter', 'sans-serif'],
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
                '4xl': '2rem',
            },
            boxShadow: {
                card: '0 1px 3px rgba(0,0,0,.10), 0 1px 2px rgba(0,0,0,.06)',
                'card-hover': '0 4px 12px rgba(0,0,0,.12)',
                product: '0 2px 8px rgba(0,0,0,.08)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease forwards',
                'slide-up': 'slideUp 0.4s ease forwards',
                'slide-down': 'slideDown 0.3s ease forwards',
                'spin-slow': 'spin 3s linear infinite',
            },
            keyframes: {
                fadeIn: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
                slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
                slideDown: { from: { opacity: '0', transform: 'translateY(-10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
            },
            screens: {
                xs: '375px',
            },
        },
    },
    plugins: [],
};

export default config;
