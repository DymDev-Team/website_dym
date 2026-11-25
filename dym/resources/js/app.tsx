import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

// Nom affiché dans l'onglet, écrit en dur : APP_NAME vaut encore « Laravel »
// dans certains .env et le build reprendrait cette valeur.
const appName = 'DYM Manufacture';

// Pages du site vitrine : elles ont leur propre en-tête/pied de page et ne
// doivent pas hériter du layout (sidebar) de l'application.
const publicPages = [
    'welcome',
    'a-propos',
    'activites',
    'activite',
    'realisation',
    'realisations',
    'marques',
    'actualites',
    'post',
    'carriere',
    'offre',
    'legal',
    'devis',
    'test-psychotechnique',
];

void createInertiaApp({
    // Les titres du site vitrine contiennent déjà le nom : pas de doublon.
    title: (title) =>
        !title
            ? appName
            : title.includes(appName)
              ? title
              : `${title} — ${appName}`,
    layout: (name) => {
        switch (true) {
            case publicPages.includes(name):
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
            case name.startsWith('teams/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
