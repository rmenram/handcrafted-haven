/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                brown: {
                    600: '#8B5E3C',
                    700: '#6E462C',
                },
            },
        },
    },
    plugins: [],
};
