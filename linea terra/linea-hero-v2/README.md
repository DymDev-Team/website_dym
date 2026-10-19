# Hero interactif — Linea Terra (reconstruction autonome)

Version 2 : reconstruction du **Hero complet** et de ses interactions, basée sur l'analyse de `index.html` du dépôt public : https://github.com/fahrurxz/linea-terra (bloc `<home-hero-wrap>` commençant environ ligne 3977 ; titre/CTA à partir de la ligne 4495). 

Ce n'est **pas une copie à l'identique du code original**. Le dépôt utilise notamment Webflow et `libs/main.js`, un grand fichier obfusqué ; pour une intégration légère et sûre, le comportement a été **réécrit** en JavaScript natif et CSS autonome. L'image jointe par l'utilisateur a été copiée telle quelle en local ; le design d'origine peut varier dans le détail.

## Essayer

1. Décompresser l'archive.
2. Ouvrir `index.html` dans Chrome ou Edge. Aucune connexion Internet requise.
3. Sur ordinateur : déplacer la souris sur l'illustration pour afficher les **lignes XY** et coordonnées. Survoler ou cliquer un repère orange pour voir les annotations.
4. Cliquer **LOUPE OFF/ON** pour zoomer autour du curseur, ou **REPÈRES ON/OFF** pour masquer les aides de dessin.
5. Réduire la fenêtre pour voir le rendu responsive. Sur écran tactile, toucher les repères orange.

## Fichiers

```
linea-hero-v2/
├── index.html                    Démo autonome avec header + Hero + lien de test
├── hero.css                      Styles, animations et responsive
├── hero.js                       Curseur, loupe, coordonnées, repères et événements
├── assets/
│   └── architecture-originale.png  Image exacte fournie dans la conversation
└── README.md
```

## Adaptation à un projet Laravel Blade

- Copier `assets/architecture-originale.png` dans `public/images/architecture-originale.png`.
- Copier `hero.css` et `hero.js` dans `public/hero/` ou importer ces deux fichiers via Vite.
- Dans le Blade, reprendre la balise `<section class="home-hero"> ... </section>` et utiliser `{{ asset('images/architecture-originale.png') }}` dans l'attribut `src` de l'image.
- Utiliser `<link rel="stylesheet" href="{{ asset('hero/hero.css') }}">` et `<script defer src="{{ asset('hero/hero.js') }}"></script>`.
- Dans `hero.css`, remplacer `background-image: url("assets/architecture-originale.png")` (classe `.magnifier`) par `background-image:url("/images/architecture-originale.png")`.
- Si les liens `#services` et `#contact` n'existent pas sur la page finale, les adapter à vos routes.

## Technique

- JavaScript natif, sans dépendance Webflow, jQuery ni GSAP.
- Animation d'entrée CSS, curseur XY fluide (`requestAnimationFrame`), loupe, repères positionnés selon `object-fit: cover`, responsive, animations réduites si demandé par l'OS.
- Touch et clavier : repères sous forme de boutons accessibles. Les coordonnées XY et la loupe sont réservées aux pointeurs fins.
- L'image du Hero est fournie par l'utilisateur ; vérifier les droits d'utilisation en publication commerciale.

**Provenance et crédits :** démarche inspirée par https://github.com/fahrurxz/linea-terra et https://heronaiapp.com/. Les sources sont citées à des fins d'étude, pas pour attribuer cette reconstruction au site officiel.
