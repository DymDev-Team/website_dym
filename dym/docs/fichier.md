<!DOCTYPE html>
<html lang="fr" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>À Propos | DYM Manufacture - Excellence Métallique & Engagement RSE/HSE</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Lucide Icons CDN -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        brand: {
                            dark: '#0F1115',
                            slate: '#181B20',
                            card: '#20242C',
                            border: '#2E3440',
                            gold: '#C5A059',
                            goldHover: '#B08C45',
                            goldLight: '#E5C158',
                            muted: '#9CA3AF',
                        }
                    },
                    fontFamily: {
                        sans: ['Inter', 'system-ui', 'sans-serif'],
                    }
                }
            }
        }
    </script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        body {
            font-family: 'Inter', sans-serif;
            background-color: #0F1115;
            color: #F3F4F6;
        }

        .gold-gradient-text {
            background: linear-gradient(135deg, #FFF0D0 0%, #C5A059 50%, #E5C158 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .gold-border-glow {
            box-shadow: 0 0 15px rgba(197, 160, 89, 0.15);
        }

        .metal-grid-bg {
            background-size: 30px 30px;
            background-image: 
                linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        }

        /* Modal backdrop blur fallback */
        .backdrop-blur-md {
            backdrop-filter: blur(12px);
        }
    </style>
</head>
<body class="antialiased selection:bg-brand-gold selection:text-brand-dark">

    <!-- ==================== HEADER / NAVBAR ==================== -->
    <header class="fixed top-0 left-0 right-0 z-40 bg-brand-dark/90 backdrop-blur-md border-b border-brand-border/60 transition-all duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <!-- Brand Logo -->
            <a href="#" class="flex items-center gap-3 group">
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-gold to-brand-goldHover flex items-center justify-center font-bold text-brand-dark text-xl shadow-lg transition-transform group-hover:scale-105">
                    DYM
                </div>
                <div class="flex flex-col">
                    <span class="font-bold text-lg tracking-wider text-white group-hover:text-brand-gold transition-colors">DYM MANUFACTURE</span>
                    <span class="text-[10px] text-brand-muted tracking-widest uppercase">Chaudronnerie & Multi-Matériaux</span>
                </div>
            </a>

        
        </div>

        <!-- Mobile Navigation Menu -->
        <div id="mobile-menu" class="hidden md:hidden bg-brand-slate border-b border-brand-border px-4 pt-2 pb-6 space-y-3">
            <a href="#mission-vision" onclick="toggleMobileMenu()" class="block py-2 text-base font-medium text-gray-200 hover:text-brand-gold">Mission & Vision</a>
            <a href="#hse" onclick="toggleMobileMenu()" class="block py-2 text-base font-medium text-gray-200 hover:text-brand-gold">Engagement HSE</a>
            <a href="#rse" onclick="toggleMobileMenu()" class="block py-2 text-base font-medium text-gray-200 hover:text-brand-gold">RSE & Durabilité</a>
            <a href="#chiffres" onclick="toggleMobileMenu()" class="block py-2 text-base font-medium text-gray-200 hover:text-brand-gold">Nos Chiffres</a>
            <button onclick="toggleMobileMenu(); openModal()" class="w-full mt-2 px-5 py-3 rounded-lg text-sm font-semibold text-brand-dark bg-brand-gold hover:bg-brand-goldLight transition-all flex items-center justify-center gap-2">
                <i data-lucide="mail" class="w-4 h-4"></i>
                Demander un Devis
            </button>
        </div>
    </header>

    <main class="pt-20">
        <!-- ==================== HERO SECTION ==================== -->
        <section class="relative min-h-[85vh] flex items-center py-20 overflow-hidden metal-grid-bg">
            <div class="absolute inset-0 bg-gradient-to-b from-brand-dark/40 via-brand-dark/80 to-brand-dark pointer-events-none"></div>

            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    
                    <!-- Left Content -->
                    <div class="lg:col-span-7 space-y-6">
                        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-semibold uppercase tracking-wider">
                            <span class="w-2 h-2 rounded-full bg-brand-gold animate-pulse"></span>
                            À Propos de DYM Manufacture
                        </div>

                        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                            Le spécialiste de la metallurgie  <br class="hidden sm:inline">
                            <span class="gold-gradient-text">Rigoureuse et Responsable.</span>
                        </h1>

                        <p class="text-base sm:text-lg text-gray-300 max-w-2xl font-normal leading-relaxed">
                            Nous concevons et façonnons des ouvrages industriels et architecturaux sur mesure en alliant haute précision technique, sécurité absolue sur chantier et durabilité garantie des matériaux.
                        </p>


                    

                </div>
            </div>
        </section>

        <!-- ==================== SECTION 1: MISSION & VISION ==================== -->
        <section id="mission-vision" class="py-20 bg-brand-slate/50 border-y border-brand-border/60">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div class="text-center max-w-3xl mx-auto mb-16 space-y-3">
                    <span class="text-xs font-semibold text-brand-gold uppercase tracking-widest bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/20">
                        Notre Raison d'Être
                    </span>
                    <h2 class="text-3xl font-extrabold text-white sm:text-4xl">
                        Un cap clair pour l'industrie de demain
                    </h2>
                    <p class="text-gray-400 text-sm sm:text-base">
                        Chaque projet est une synthèse entre précision technique et responsabilité industrielle.
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <!-- Mission Card -->
                    <div class="bg-brand-card p-8 rounded-2xl border border-brand-border hover:border-brand-gold/40 transition-all duration-300 flex flex-col justify-between group shadow-lg">
                        <div class="space-y-4">
                            <div class="w-14 h-14 rounded-xl bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold group-hover:scale-110 transition-transform">
                                <i data-lucide="compass" class="w-7 h-7"></i>
                            </div>
                            <span class="text-xs font-mono text-brand-gold uppercase tracking-widest">Orientation Stratégique</span>
                            <h3 class="text-2xl font-bold text-white">Notre Mission</h3>
                            <p class="text-gray-300 text-sm leading-relaxed">
                                Concevoir et fabriquer des ouvrages métalliques et multi-matériaux sur mesure, en garantissant une précision d'exécution irréprochable et un suivi rigoureux à chaque étape du projet, de l'étude B2B jusqu'à la pose finale sur chantier.
                            </p>
                        </div>
                        <ul class="mt-6 pt-6 border-t border-brand-border/60 space-y-2 text-xs text-gray-400">
                            <li class="flex items-center gap-2">
                                <i data-lucide="check" class="w-4 h-4 text-brand-gold"></i> Étude personnalisée & métrés de précision
                            </li>
                            <li class="flex items-center gap-2">
                                <i data-lucide="check" class="w-4 h-4 text-brand-gold"></i> Sélection d'alliages certifiés & traçables
                            </li>
                        </ul>
                    </div>

                    <!-- Vision Card -->
                    <div class="bg-brand-card p-8 rounded-2xl border border-brand-border hover:border-brand-gold/40 transition-all duration-300 flex flex-col justify-between group shadow-lg">
                        <div class="space-y-4">
                            <div class="w-14 h-14 rounded-xl bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold group-hover:scale-110 transition-transform">
                                <i data-lucide="target" class="w-7 h-7"></i>
                            </div>
                            <span class="text-xs font-mono text-brand-gold uppercase tracking-widest">Ambition & Avenir</span>
                            <h3 class="text-2xl font-bold text-white">Notre Vision</h3>
                            <p class="text-gray-300 text-sm leading-relaxed">
                                Devenir la référence industrielle régionale en matière d'innovation rigoureuse, de sécurité sur chantier et de fabrication responsable pour tous les projets architecturaux, tertiaires et industriels d'envergure.
                            </p>
                        </div>
                        <ul class="mt-6 pt-6 border-t border-brand-border/60 space-y-2 text-xs text-gray-400">
                            <li class="flex items-center gap-2">
                                <i data-lucide="check" class="w-4 h-4 text-brand-gold"></i> Décarbonation progressive des process d'usinage
                            </li>
                            <li class="flex items-center gap-2">
                                <i data-lucide="check" class="w-4 h-4 text-brand-gold"></i> Standard 'Zéro Accident' sur tous nos chantiers
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </section>

        <!-- ==================== SECTION 2: POLITIQUES HSE ==================== -->
        <section id="hse" class="py-20 relative">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <div class="inline-flex items-center gap-2 text-xs font-semibold text-brand-gold uppercase tracking-widest bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/20 mb-3">
                            <i data-lucide="shield" class="w-3.5 h-3.5"></i> Normes & Rigueurs Opérationnelles
                        </div>
                        <h2 class="text-3xl font-extrabold text-white sm:text-4xl">
                            Politique HSE : La Sécurité sans Compromis
                        </h2>
                    </div>
                    <p class="text-gray-400 text-sm max-w-md">
                        La qualité d'un ouvrage ne s'arrête pas à son esthétique. Elle repose sur la maîtrise totale des risques humains et environnementaux en atelier comme sur chantier.
                    </p>
                </div>

                <!-- Grid HSE 3 Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    <!-- Card 1 -->
                    <div class="bg-brand-slate p-6 rounded-xl border border-brand-border hover:border-brand-gold/40 transition-all">
                        <div class="w-12 h-12 rounded-lg bg-brand-gold/10 text-brand-gold flex items-center justify-center mb-6">
                            <i data-lucide="hard-hat" class="w-6 h-6"></i>
                        </div>
                        <h3 class="text-xl font-bold text-white mb-3">Sécurité des Équipes</h3>
                        <ul class="space-y-3 text-sm text-gray-300">
                            <li class="flex items-start gap-2.5">
                                <i data-lucide="shield-alert" class="w-4 h-4 text-brand-gold shrink-0 mt-0.5"></i>
                                <span>Port systématique des EPI obligatoires en atelier et sur site client.</span>
                            </li>
                            <li class="flex items-start gap-2.5">
                                <i data-lucide="shield-alert" class="w-4 h-4 text-brand-gold shrink-0 mt-0.5"></i>
                                <span>Protocoles stricts pour la manipulation des machines et charges lourdes.</span>
                            </li>
                            <li class="flex items-start gap-2.5">
                                <i data-lucide="shield-alert" class="w-4 h-4 text-brand-gold shrink-0 mt-0.5"></i>
                                <span>Procédures d'ancrage et de pose sécurisées pour les utilisateurs.</span>
                            </li>
                        </ul>
                    </div>

                    <!-- Card 2 -->
                    <div class="bg-brand-slate p-6 rounded-xl border border-brand-border hover:border-brand-gold/40 transition-all">
                        <div class="w-12 h-12 rounded-lg bg-brand-gold/10 text-brand-gold flex items-center justify-center mb-6">
                            <i data-lucide="activity" class="w-6 h-6"></i>
                        </div>
                        <h3 class="text-xl font-bold text-white mb-3">Santé & Ergonomie</h3>
                        <ul class="space-y-3 text-sm text-gray-300">
                            <li class="flex items-start gap-2.5">
                                <i data-lucide="heart-pulse" class="w-4 h-4 text-brand-gold shrink-0 mt-0.5"></i>
                                <span>Aménagement ergonomique des postes d'usinage et d'assemblage.</span>
                            </li>
                            <li class="flex items-start gap-2.5">
                                <i data-lucide="heart-pulse" class="w-4 h-4 text-brand-gold shrink-0 mt-0.5"></i>
                                <span>Prévention active des risques professionnels et des TMS (troubles musculo-squelettiques).</span>
                            </li>
                            <li class="flex items-start gap-2.5">
                                <i data-lucide="heart-pulse" class="w-4 h-4 text-brand-gold shrink-0 mt-0.5"></i>
                                <span>Maintien d'un environnement de travail propre, ordonné et régulièrement audité.</span>
                            </li>
                        </ul>
                    </div>

                    <!-- Card 3 -->
                    <div class="bg-brand-slate p-6 rounded-xl border border-brand-border hover:border-brand-gold/40 transition-all">
                        <div class="w-12 h-12 rounded-lg bg-brand-gold/10 text-brand-gold flex items-center justify-center mb-6">
                            <i data-lucide="leaf" class="w-6 h-6"></i>
                        </div>
                        <h3 class="text-xl font-bold text-white mb-3">Maîtrise des Impacts</h3>
                        <ul class="space-y-3 text-sm text-gray-300">
                            <li class="flex items-start gap-2.5">
                                <i data-lucide="fan" class="w-4 h-4 text-brand-gold shrink-0 mt-0.5"></i>
                                <span>Captation haute performance des fumées de soudure et contrôle des émissions.</span>
                            </li>
                            <li class="flex items-start gap-2.5">
                                <i data-lucide="fan" class="w-4 h-4 text-brand-gold shrink-0 mt-0.5"></i>
                                <span>Gestion stricte des étincelles et réduction des nuisances sonores.</span>
                            </li>
                            <li class="flex items-start gap-2.5">
                                <i data-lucide="fan" class="w-4 h-4 text-brand-gold shrink-0 mt-0.5"></i>
                                <span>Stockage sécurisé des produits de finition et gestion responsable des consommables.</span>
                            </li>
                        </ul>
                    </div>

                </div>

            </div>
        </section>

        <!-- ==================== SECTION 3: RSE & DEVELOPPEMENT DURABLE ==================== -->
        <section id="rse" class="py-20 bg-brand-slate/40 border-t border-brand-border/60">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div class="text-center max-w-3xl mx-auto mb-16 space-y-3">
                    <span class="text-xs font-semibold text-brand-gold uppercase tracking-widest bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/20">
                        Engagement RSE
                    </span>
                    <h2 class="text-3xl font-extrabold text-white sm:text-4xl">
                        Une Fabrication Pensée pour Durere & Respecter les Ressources
                    </h2>
                    <p class="text-gray-400 text-sm sm:text-base">
                        Découvrez comment nous intégrons la responsabilité sociétale au cœur de nos processus de fabrication.
                    </p>
                </div>

                <!-- Interactive Tabs Container -->
                <div class="bg-brand-card rounded-2xl border border-brand-border p-6 sm:p-8 shadow-xl">
                    
                    <!-- Tab Buttons -->
                    <div class="flex flex-wrap gap-2 border-b border-brand-border pb-6 mb-8">
                        <button onclick="switchTab('recyclage')" id="tab-btn-recyclage" class="tab-btn px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 bg-brand-gold text-brand-dark">
                            <i data-lucide="recycle" class="w-4 h-4"></i>
                            1. Recyclage & Matière
                        </button>
                        <button onclick="switchTab('durabilite')" id="tab-btn-durabilite" class="tab-btn px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-400 hover:text-white transition-all flex items-center gap-2 bg-brand-slate">
                            <i data-lucide="shield-check" class="w-4 h-4"></i>
                            2. Durabilité & Finitions
                        </button>
                        <button onclick="switchTab('ancrage')" id="tab-btn-ancrage" class="tab-btn px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-400 hover:text-white transition-all flex items-center gap-2 bg-brand-slate">
                            <i data-lucide="users" class="w-4 h-4"></i>
                            3. Ancrage Local & Capital Humain
                        </button>
                    </div>

                    <!-- Tab Content 1: Recyclage -->
                    <div id="tab-content-recyclage" class="tab-content grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div class="lg:col-span-7 space-y-4">
                            <span class="text-xs font-mono text-brand-gold uppercase tracking-wider">Optimisation des Matières Premières</span>
                            <h3 class="text-2xl font-bold text-white">Gestion Intelligente des Métaux & Déchets</h3>
                            <p class="text-gray-300 text-sm leading-relaxed">
                                Dans notre atelier, chaque tôle et chaque profilé est optimisé grâce à nos logiciels de découpe automatique (imbrication de pièces). Cela nous permet de réduire au strict minimum les chutages de métal.
                            </p>
                            <ul class="space-y-2 text-sm text-gray-300 pt-2">
                                <li class="flex items-center gap-2">
                                    <i data-lucide="check-circle-2" class="w-4 h-4 text-brand-gold shrink-0"></i> Revalorisation à 100% des chutes métalliques auprès de filières de recyclage agréées.
                                </li>
                                <li class="flex items-center gap-2">
                                    <i data-lucide="check-circle-2" class="w-4 h-4 text-brand-gold shrink-0"></i> Tri sélectif rigoureux de tous les déchets industriels banals et dangereux.
                                </li>
                            </ul>
                        </div>
                        <div class="lg:col-span-5 bg-brand-slate p-6 rounded-xl border border-brand-border space-y-4">
                            <div class="text-center py-4">
                                <p class="text-4xl font-extrabold text-brand-gold font-mono">100%</p>
                                <p class="text-xs text-gray-400 uppercase tracking-wider mt-1">Des Chutes Métalliques Revalorisées</p>
                            </div>
                            <div class="p-3 bg-brand-dark/60 rounded-lg text-xs text-gray-400 border border-brand-border">
                                <span class="font-semibold text-white">Indicateur d'Atelier :</span> Zéro déchet métallique non-traité. Traçabilité complète du cycle de réutilisation des sous-produits.
                            </div>
                        </div>
                    </div>

                    <!-- Tab Content 2: Durabilité -->
                    <div id="tab-content-durabilite" class="tab-content hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div class="lg:col-span-7 space-y-4">
                            <span class="text-xs font-mono text-brand-gold uppercase tracking-wider">Pérennité des Ouvrages</span>
                            <h3 class="text-2xl font-bold text-white">Traitement Anti-Corrosion & Matériaux Résistants</h3>
                            <p class="text-gray-300 text-sm leading-relaxed">
                                Un ouvrage durable est un ouvrage qui résiste à l'épreuve du temps et des contraintes climatiques. Nous appliquons des traitements de surface de haute qualité (galvanisation, thermolaquage, finitions anticorrosion).
                            </p>
                            <ul class="space-y-2 text-sm text-gray-300 pt-2">
                                <li class="flex items-center gap-2">
                                    <i data-lucide="check-circle-2" class="w-4 h-4 text-brand-gold shrink-0"></i> Choix rigoureux d'alliages adaptés à chaque environnement (intérieu/extérieur/marin).
                                </li>
                                <li class="flex items-center gap-2">
                                    <i data-lucide="check-circle-2" class="w-4 h-4 text-brand-gold shrink-0"></i> Conception pensée pour faciliter la maintenance future et réduire les coûts globaux.
                                </li>
                            </ul>
                        </div>
                        <div class="lg:col-span-5 bg-brand-slate p-6 rounded-xl border border-brand-border space-y-4">
                            <div class="text-center py-4">
                                <p class="text-4xl font-extrabold text-brand-gold font-mono">20+ Ans</p>
                                <p class="text-xs text-gray-400 uppercase tracking-wider mt-1">Résistance Estimée aux Intempéries</p>
                            </div>
                            <div class="p-3 bg-brand-dark/60 rounded-lg text-xs text-gray-400 border border-brand-border">
                                <span class="font-semibold text-white">Standard Qualité :</span> Application strictement conforme aux exigences d'exposition en milieu industriel et urbain.
                            </div>
                        </div>
                    </div>

                    <!-- Tab Content 3: Ancrage Local -->
                    <div id="tab-content-ancrage" class="tab-content hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div class="lg:col-span-7 space-y-4">
                            <span class="text-xs font-mono text-brand-gold uppercase tracking-wider">Social & Territoire</span>
                            <h3 class="text-2xl font-bold text-white">Ancrage Territorial & Montée en Compétences</h3>
                            <p class="text-gray-300 text-sm leading-relaxed">
                                Nous investissons continuellement dans l'humain. Transmettre les savoir-faire de la chaudronnerie et de la métallerie est essentiel pour préserver l'excellence industrielle de notre territoire.
                            </p>
                            <ul class="space-y-2 text-sm text-gray-300 pt-2">
                                <li class="flex items-center gap-2">
                                    <i data-lucide="check-circle-2" class="w-4 h-4 text-brand-gold shrink-0"></i> Plan de formation continue pour nos soudeurs, ajusteurs et chefs de chantier.
                                </li>
                                <li class="flex items-center gap-2">
                                    <i data-lucide="check-circle-2" class="w-4 h-4 text-brand-gold shrink-0"></i> Partenariats avec les acteurs économiques et sous-traitants locaux.
                                </li>
                            </ul>
                        </div>
                        <div class="lg:col-span-5 bg-brand-slate p-6 rounded-xl border border-brand-border space-y-4">
                            <div class="text-center py-4">
                                <p class="text-4xl font-extrabold text-brand-gold font-mono">100%</p>
                                <p class="text-xs text-gray-400 uppercase tracking-wider mt-1">Équipes & Partenaires Régionaux</p>
                            </div>
                            <div class="p-3 bg-brand-dark/60 rounded-lg text-xs text-gray-400 border border-brand-border">
                                <span class="font-semibold text-white">Valeur Humaine :</span> Promotion de l'apprentissage et valorisation des métiers manuels qualifiés.
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </section>

        <!-- ==================== SECTION 4: CHIFFRES CLES & REASSURANCE ==================== -->
        <section id="chiffres" class="py-20 bg-brand-dark relative overflow-hidden">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                <div class="p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-brand-slate via-brand-card to-brand-slate border border-brand-gold/30 shadow-2xl">
                    <div class="text-center max-w-2xl mx-auto mb-10">
                        <h2 class="text-2xl sm:text-3xl font-extrabold text-white">
                            Indicateurs de Réassurance B2B
                        </h2>
                        <p class="text-xs sm:text-sm text-brand-muted mt-2">
                            Des standards rigoureux mesurés pour la tranquillité d'esprit de nos donneurs d'ordre.
                        </p>
                    </div>

                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-brand-border/60">
                        
                        <!-- Metric 1 -->
                        <div class="pt-4 lg:pt-0">
                            <p class="text-3xl sm:text-5xl font-extrabold text-brand-gold font-mono tracking-tight">0</p>
                            <p class="text-sm font-semibold text-white mt-2">Accident Majeur</p>
                            <p class="text-xs text-gray-400 mt-1">Objectif permanent sur nos chantiers</p>
                        </div>

                        <!-- Metric 2 -->
                        <div class="pt-4 lg:pt-0">
                            <p class="text-3xl sm:text-5xl font-extrabold text-brand-gold font-mono tracking-tight">100%</p>
                            <p class="text-sm font-semibold text-white mt-2">Sur Mesure Validé</p>
                            <p class="text-xs text-gray-400 mt-1">Selon les normes de résistance</p>
                        </div>

                        <!-- Metric 3 -->
                        <div class="pt-4 lg:pt-0">
                            <p class="text-3xl sm:text-5xl font-extrabold text-brand-gold font-mono tracking-tight">Longue</p>
                            <p class="text-sm font-semibold text-white mt-2">Durabilité Garantie</p>
                            <p class="text-xs text-gray-400 mt-1">Traitements anticorrosion maîtrisés</p>
                        </div>

                        <!-- Metric 4 -->
                        <div class="pt-4 lg:pt-0">
                            <p class="text-3xl sm:text-5xl font-extrabold text-brand-gold font-mono tracking-tight">Précis</p>
                            <p class="text-sm font-semibold text-white mt-2">Dimensionnement</p>
                            <p class="text-xs text-gray-400 mt-1">Contrôle structurel rigoureux</p>
                        </div>

                    </div>
                </div>

            </div>
        </section>

        <!-- ==================== SECTION 5: CALL TO ACTION ==================== -->
        <section class="py-20 bg-brand-slate/60">
            <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                
                <div class="bg-brand-card p-8 sm:p-12 rounded-2xl border border-brand-border shadow-2xl relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-48 h-48 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none"></div>

                    <span class="text-xs font-mono text-brand-gold uppercase tracking-widest bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/20">
                        Engagement & Partenariat
                    </span>

                    <h2 class="text-2xl sm:text-4xl font-extrabold text-white mt-6 mb-4">
                        Un Projet d'Aménagement ou d'Ouvrage Métallique ?
                    </h2>

                    <p class="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto mb-8">
                        Échangeons sur vos contraintes techniques, vos exigences de sécurité HSE et vos besoins de fabrication sur mesure.
                    </p>

                    <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onclick="openModal()" class="w-full sm:w-auto px-8 py-4 rounded-lg text-base font-semibold text-brand-dark bg-brand-gold hover:bg-brand-goldLight transition-all duration-200 shadow-lg flex items-center justify-center gap-2">
                            <i data-lucide="send" class="w-5 h-5"></i>
                            Demander un Devis / Échanger avec un Expert
                        </button>
                    </div>
                </div>

            </div>
        </section>
    </main>

    <!-- ==================== FOOTER ==================== -->
    <footer class="bg-brand-dark border-t border-brand-border py-12 text-xs text-brand-muted">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                
                <div class="space-y-3">
                    <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded bg-brand-gold flex items-center justify-center font-bold text-brand-dark text-sm">
                            DYM
                        </div>
                        <span class="font-bold text-white text-sm">DYM MANUFACTURE</span>
                    </div>
                    <p class="text-gray-400">Spécialiste de la fabrication métallique sur mesure et des ouvrages multi-matériaux haute précision.</p>
                </div>

                <div>
                    <p class="font-semibold text-white mb-3 text-sm">Navigation</p>
                    <ul class="space-y-2">
                        <li><a href="#mission-vision" class="hover:text-brand-gold transition-colors">Mission & Vision</a></li>
                        <li><a href="#hse" class="hover:text-brand-gold transition-colors">Politique HSE</a></li>
                        <li><a href="#rse" class="hover:text-brand-gold transition-colors">Engagement RSE</a></li>
                        <li><a href="#chiffres" class="hover:text-brand-gold transition-colors">Chiffres Clés</a></li>
                    </ul>
                </div>

                <div>
                    <p class="font-semibold text-white mb-3 text-sm">Engagements</p>
                    <ul class="space-y-2">
                        <li>Sécurité Chantier Zéro Accident</li>
                        <li>Valorisation 100% Matières</li>
                        <li>Normes de Résistance Validées</li>
                        <li>Traçabilité Industrielle</li>
                    </ul>
                </div>

                <div>
                    <p class="font-semibold text-white mb-3 text-sm">Contact Pro</p>
                    <p class="text-gray-400">Atelier & Bureau d'Études</p>
                    <p class="text-gray-300 mt-1">contact@dym-manufacture.fr</p>
                    <button onclick="openModal()" class="mt-3 text-brand-gold hover:underline flex items-center gap-1 font-semibold">
                        Formulaire de Devis <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                    </button>
                </div>

            </div>

            <div class="pt-8 border-t border-brand-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p>&copy; 2026 DYM Manufacture. Tous droits réservés.</p>
                <div class="flex items-center gap-6">
                    <a href="#" class="hover:text-gray-300">Mentions Légales</a>
                    <a href="#" class="hover:text-gray-300">Politique de Confidentialité</a>
                    <a href="#" class="hover:text-gray-300">Charte HSE & RSE</a>
                </div>
            </div>
        </div>
    </footer>

    <!-- ==================== CONTACT MODAL ==================== -->
    <div id="contact-modal" class="fixed inset-0 z-50 hidden items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div class="bg-brand-card border border-brand-border rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            
            <button onclick="closeModal()" class="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-lg bg-brand-slate">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>

            <div class="mb-6">
                <span class="text-xs font-mono text-brand-gold uppercase tracking-widest">Contact Direct</span>
                <h3 class="text-xl font-bold text-white mt-1">Échanger sur votre Projet</h3>
                <p class="text-xs text-gray-400 mt-1">Laissez-nous vos coordonnées, nos ingénieurs vous recontacteront sous 24h.</p>
            </div>

            <form onsubmit="handleFormSubmit(event)" class="space-y-4">
                <div>
                    <label class="block text-xs font-semibold text-gray-300 uppercase mb-1">Nom / Entreprise *</label>
                    <input type="text" required placeholder="Ex: Jean Dupont - Cabinet Architectes" class="w-full bg-brand-slate border border-brand-border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold">
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold text-gray-300 uppercase mb-1">Email Professionnel *</label>
                        <input type="email" required placeholder="contact@societe.fr" class="w-full bg-brand-slate border border-brand-border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-gray-300 uppercase mb-1">Téléphone</label>
                        <input type="tel" placeholder="01 23 45 67 89" class="w-full bg-brand-slate border border-brand-border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold">
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-gray-300 uppercase mb-1">Type de Projet</label>
                    <select class="w-full bg-brand-slate border border-brand-border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold">
                        <option>Ouvrage Métallique Sur Mesure</option>
                        <option>Aménagement Industriel / Tertiaire</option>
                        <option>Chaudronnerie & Multi-Matériaux</option>
                        <option>Demande d'informations RSE / HSE</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-gray-300 uppercase mb-1">Description succincte *</label>
                    <textarea rows="3" required placeholder="Précisez les dimensions, contraintes ou délais..." class="w-full bg-brand-slate border border-brand-border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"></textarea>
                </div>

                <div class="pt-2">
                    <button type="submit" class="w-full py-3 rounded-lg text-sm font-semibold text-brand-dark bg-brand-gold hover:bg-brand-goldLight transition-all flex items-center justify-center gap-2">
                        <i data-lucide="send" class="w-4 h-4"></i>
                        Envoyer ma Demande
                    </button>
                </div>
            </form>

            <div id="form-success" class="hidden mt-4 p-3 bg-green-500/20 border border-green-500/40 rounded-lg text-xs text-green-300 text-center">
                Votre message a été transmis à l'équipe technique avec succès !
            </div>

        </div>
    </div>

    <!-- ==================== JAVASCRIPT ==================== -->
    <script>
        // Initialize Lucide Icons
        lucide.createIcons();

        // Mobile Menu Toggle
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');

        function toggleMobileMenu() {
            mobileMenu.classList.toggle('hidden');
        }

        mobileMenuBtn.addEventListener('click', toggleMobileMenu);

        // Tab Switching for RSE Section
        function switchTab(tabKey) {
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });

            // Reset all tab button styles
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('bg-brand-gold', 'text-brand-dark');
                btn.classList.add('bg-brand-slate', 'text-gray-400');
            });

            // Show active tab content
            const activeContent = document.getElementById(tab-content-${tabKey});
            if (activeContent) {
                activeContent.classList.remove('hidden');
            }

            // Highlight active button
            const activeBtn = document.getElementById(tab-btn-${tabKey});
            if (activeBtn) {
                activeBtn.classList.remove('bg-brand-slate', 'text-gray-400');
                activeBtn.classList.add('bg-brand-gold', 'text-brand-dark');
            }
        }

        // Contact Modal Logic
        const modal = document.getElementById('contact-modal');

        function openModal() {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeModal() {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.getElementById('form-success').classList.add('hidden');
        }

        // Close Modal when clicking backdrop
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Handle Form Submission
        function handleFormSubmit(event) {
            event.preventDefault();
            const successBox = document.getElementById('form-success');
            successBox.classList.remove('hidden');

            setTimeout(() => {
                closeModal();
                event.target.reset();
            }, 2000);
        }
    </script>
</body>
</html>