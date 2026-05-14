# KittyCook

KittyCook est un party game coopératif 3D isométrique web-first où des chats chefs
essaient de sauver un service adorable au bord du chaos.

Le projet garde une règle simple : prouver que la boucle locale est drôle et lisible
avant de produire beaucoup de contenu.

## North Star

KittyCook doit donner l'impression de sauver un service impossible avec une brigade
de chats adorables, où chaque catastrophe devient une blague collective.

## Stack

- TypeScript
- Vite
- Three.js
- HUD DOM
- Clavier local et manette en priorité

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

Sur cette machine Windows, PowerShell peut bloquer `npm.ps1`. Utilise `npm.cmd`
si besoin :

```powershell
npm.cmd install
npm.cmd run dev
```

## Structure Du Projet

```txt
src/
  data/             Recettes et définitions de niveaux
  game/
    audio/          Signaux audio et futur mixeur
    input/          Clavier, manette, puis téléphone-manette plus tard
    render/         Scène Three.js, caméra, meshes, VFX
    simulation/     État gameplay autoritaire et règles fixed-step
    systems/        Recettes, commandes, stations, score et niveaux
    types.ts        Types gameplay partagés
  ui/               HUD DOM et menus
```

## Lecture Requise

Avant d'ajouter des features, lire :

- `KITTYCOOK_STRATEGY.md`
- `AGENTS.md`
- `docs/MILESTONE_01_MICRO_PROTOTYPE.md`

## Objectif Actuel

Faire évoluer l'alpha visuelle en prototype jouable, cosy et immédiatement lisible.

Le prototype est réussi si les joueurs comprennent vite l'objectif, reconnaissent
l'identité de chats cuisiniers depuis une capture, rient pendant les tests, et
demandent à relancer.

## Contrôles Actuels

Joueur 1 :

- `WASD` : bouger
- `Space` : interagir
- `Q` : poser / annuler
- `E` : miaou de motivation
- `Left Shift` : dash

Joueur 2 :

- `Flèches` : bouger
- `Enter` : interagir
- `Backspace` : poser / annuler
- `/` : miaou de motivation
- `Right Shift` : dash

Commun :

- `R` : réinitialiser / rejouer la manche

Manette :

- Stick gauche : bouger
- `A` : interagir
- `B` : poser / annuler
- `X` : dash
- `Y` : miaou de motivation
- Start/Menu : réinitialiser

## Boucle De Jeu Actuelle

1. Prendre une assiette aux `Assiettes`.
2. La poser sur `Assemblage`.
3. Prendre les ingrédients dans les caisses.
4. Couper le poisson ou les herbes à `Découpe`.
5. Cuire le poisson à `Cuisson` et le récupérer avant qu'il brûle.
6. Ajouter les ingrédients à l'assiette sur `Assemblage`.
7. Prendre le plat et le livrer au `Service`.
8. Éviter la flaque de lait, ou glisser dedans pour la science.

## Direction Alpha Visuelle

- Modèles procéduraux Three.js, sans pipeline GLB obligatoire pour l'instant.
- Chats cartoon avec toque, oreilles, queue, pattes, anneaux joueurs et animation simple.
- Stations différenciées par silhouette, couleur et halo de proximité.
- Le jeu démarre sur un menu basique de sélection de niveau.
- Deux cuisines existent : `Comptoir des coussins` et `Boulangerie au clair de lune`.
- Décor cosy : comptoirs, carrelage, empreintes de pattes, tapis coussin, enseigne,
  lampes chaudes, fenêtres lumineuses et zones fonctionnelles lisibles.
- VFX déclenchés par les événements de simulation : onde de miaou, éclats de découpe,
  vapeur, fumée de brûlé, éclaboussures de lait et pop de score.
