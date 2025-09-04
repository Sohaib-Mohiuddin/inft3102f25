import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        tailwindcss(),
    ],
    server: {
        host: true,
        port: 5173,
        strictPort: true,
        // Proxy everything except Vite's own HMR/asset paths to the PHP server
        proxy: {
        // Proxy API & Laravel routes (root) to PHP dev server
        '^/(?!@vite|resources|node_modules|src|vendor|build|assets)': {
            target: 'http://php:8000',
            changeOrigin: true,
            secure: false,
        },
        },
    },
});
