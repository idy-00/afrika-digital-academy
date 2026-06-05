# Afrika Digital Academy — Landing Page

Landing page de vente avec intégration Chariow et Facebook Pixel.

---

## Structure du projet

```
afrika-digital-academy/
├── public/
│   └── index.html        # Landing page (HTML/CSS/JS)
├── server.js             # Serveur Express (API proxy Chariow)
├── package.json
├── vercel.json           # Config déploiement Vercel
├── .env.example          # Variables d'environnement à copier
└── .gitignore
```

---

## Démarrage local

### 1. Prérequis
- Node.js 18+ installé
- Un compte Chariow avec une clé API

### 2. Installation

```bash
cd afrika-digital-academy
npm install
```

### 3. Configuration

```bash
cp .env.example .env
```

Ouvre `.env` et remplis :
```
CHARIOW_API_KEY=ta_vraie_clé_chariow
```

Dans `public/index.html`, remplace `PIXEL_ID_ICI` par ton ID Pixel Facebook (recherche/remplace dans le fichier).

### 4. Lancer le serveur

```bash
npm start
# ou en mode dev avec rechargement automatique :
npm run dev
```

Ouvre http://localhost:3000

---

## Déploiement sur Vercel

### Option A — Via l'interface Vercel (recommandé)

1. Pousse ton code sur GitHub :
   ```bash
   git init
   git add .
   git commit -m "feat: landing page Afrika Digital Academy"
   git remote add origin https://github.com/TON_COMPTE/TON_REPO.git
   git push -u origin main
   ```

2. Va sur [vercel.com](https://vercel.com) → **New Project** → importe ton dépôt GitHub.

3. Dans **Environment Variables**, ajoute :
   | Variable | Valeur |
   |---|---|
   | `CHARIOW_API_KEY` | ta clé Chariow |
   | `NODE_ENV` | `production` |

4. Clique **Deploy**. Vercel détecte automatiquement `vercel.json`.

### Option B — Via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

Lors du premier déploiement, définis les variables d'environnement via l'interface Vercel Dashboard → Settings → Environment Variables.

---

## Variables d'environnement

| Variable | Obligatoire | Description |
|---|---|---|
| `CHARIOW_API_KEY` | ✅ | Clé API Chariow (ne jamais la mettre dans le frontend) |
| `PORT` | ✗ | Port du serveur (défaut : 3000, Vercel l'ignore) |
| `NODE_ENV` | ✗ | `production` en prod |

---

## Produits configurés

| Offre | Product ID | Prix |
|---|---|---|
| Pack Essentiel | `prd_ps3esweo` | 2 500 F CFA |
| Formation Complète | `prd_r9u520m5` | 4 999 F CFA (barré 9 900) |

Boutique : [uiytijwe.mychariow.shop](https://uiytijwe.mychariow.shop)

---

## Contact

- **Propriétaire** : Idrissa KANE
- **Email** : idykane03@gmail.com
- **Téléphone** : +221 781 194 805
