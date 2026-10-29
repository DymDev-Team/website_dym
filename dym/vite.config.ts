import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig, lazyPlugins } from 'vite-plus';

export default defineConfig({
    plugins: lazyPlugins(() => [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600, 700],
                }),
            ],
        }),
        inertia(),
        react(),
        babel({
            presets: [reactCompilerPreset()],
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ]),
    server: {
        // Pré-compile l'admin au démarrage : sur un volume Windows, chaque
        // module servi à la demande est lent (connexion au panel).
        warmup: {
            clientFiles: [
                './resources/js/app.tsx',
                './resources/js/layouts/**/*.tsx',
                './resources/js/pages/admin/**/*.tsx',
            ],
        },
        ...(process.env.LARAVEL_SAIL
            ? {
                  // 127.0.0.1 et non localhost : sous Windows, localhost tente d'abord IPv6
                  // (::1, non publié par Docker) et perd ~0,2 s par module chargé.
                  origin: `http://127.0.0.1:${process.env.VITE_PORT ?? 5173}`,
                  cors: { origin: /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/ },
                  hmr: {
                      host: '127.0.0.1',
                      clientPort: Number(process.env.VITE_PORT ?? 5173),
                  },
              }
            : {}),
        watch: {
            usePolling: Boolean(process.env.LARAVEL_SAIL),
            ignored: [
                '**/.agents/**',
                '**/.claude/**',
                '**/.cursor/**',
                '**/.junie/**',
                '**/vendor/**',
            ],
        },
    },
    lint: {
        ignorePatterns: [
            'vendor/**',
            'node_modules/**',
            'public/**',
            'bootstrap/ssr/**',
            'tailwind.config.js',
            'resources/js/actions/**',
            'resources/js/components/ui/*',
            'resources/js/routes/**',
            'resources/js/wayfinder/**',
        ],
        options: {
            denyWarnings: true,
            typeAware: true,
        },
    },
    fmt: {
        printWidth: 80,
        tabWidth: 4,
        singleQuote: true,
        semi: true,
        singleAttributePerLine: false,
        htmlWhitespaceSensitivity: 'css',
        ignorePatterns: [
            '.github/**',
            'composer.json',
            'resources/js/components/ui/*',
            'resources/views/mail/*',
        ],
        sortTailwindcss: {
            functions: ['clsx', 'cn', 'cva'],
            stylesheet: 'resources/css/app.css',
        },
    },
});
