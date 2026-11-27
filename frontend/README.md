# Frontend – PFE Manager

Interface web (React + Vite) pour gérer les étudiants, les projets, les professeurs, les soutenances et l'assistant IA.

## Prérequis

- Node.js 22 (ou au moins 20.19) et npm
- Docker Desktop (seulement pour la méthode 2)

## Méthode 1 : lancer en développement (sans backend)

Le projet contient des données statiques (mode mock), donc le frontend fonctionne seul.

```bash
cd frontend
npm install
npm run dev
```

Ouvrir http://localhost:5173

Les modifications faites dans l'interface sont gardées en mémoire et disparaissent au rechargement de la page. C'est normal.

## Méthode 2 : lancer avec Docker

```bash
cd frontend
docker build -t pfe-frontend .
docker run --rm -p 8080:80 pfe-frontend
```

Ouvrir http://localhost:8080 (arrêt avec `Ctrl + C`).

Pour lancer toute l'application (frontend, backend, service IA), utiliser le `docker-compose.yml` à la racine du dépôt.

## Mode mock ou vrai backend

Le choix se fait dans `src/api.js` :

```js
const USE_MOCK = true;   // données statiques (src/mock.js)
const USE_MOCK = false;  // vrai backend, appels sous /api
```

Avec `false` en développement local, le backend Flask doit tourner sur le port 5000 : le proxy de Vite redirige `/api` vers `http://localhost:5000`. En Docker, c'est nginx qui redirige `/api/` vers le service `backend`.

## Structure

```
frontend/
├── src/
│   ├── api.js            # client API (mock ou réel)
│   ├── mock.js           # données statiques
│   ├── styles.css
│   ├── App.jsx           # menu et routes
│   ├── components/
│   │   └── Crud.jsx      # tableau + formulaire générique
│   └── pages/            # une page par fichier (auto-découverte)
├── Dockerfile
├── nginx.conf
└── package.json
```

## Ajouter une page

Créer un fichier dans `src/pages/` qui exporte `meta` et un composant par défaut. Le menu et les routes se mettent à jour automatiquement, sans modifier `App.jsx` :

```jsx
export const meta = { path: "/exemple", label: "Exemple", order: 6 };
export default function Exemple() { return <h2>Exemple</h2>; }
```

## Commandes utiles

| Commande | Rôle |
| --- | --- |
| `npm run dev` | serveur de développement |
| `npm run build` | version de production dans `dist/` |
| `npm run lint` | vérification du code |

## Pages

Étudiants, Projets PFE, Professeurs (avec disponibilités), Soutenances (planification et conflits), Assistant IA (recommandation de jury).