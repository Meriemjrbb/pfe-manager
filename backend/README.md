# Backend – PFE Manager

API Flask pour gérer les étudiants, les projets, les professeurs, les soutenances et le proxy vers l'assistant IA.

## Prérequis

- Python 3.12+ et pip
- PostgreSQL (seulement pour la méthode 1, en prod)
- Docker Desktop (seulement pour la méthode 2)

## Méthode 1 : lancer en développement local

```bash
cd backend
pip install -r requirements.txt
flask --app "app:create_app" run
```

Ouvrir http://localhost:5000/api

Par défaut, la base de données est SQLite (`sqlite:///app.db`). Pour utiliser PostgreSQL :

```bash
export SQLALCHEMY_DATABASE_URI="postgresql://user:pass@localhost/pfe"
flask --app "app:create_app" run
```

## Méthode 2 : lancer avec Docker

```bash
cd backend
docker build -t pfe-backend .
docker run --rm -p 5000:5000 pfe-backend
```

Ouvrir http://localhost:5000/api (arrêt avec `Ctrl + C`).

Pour lancer toute l'application (frontend, backend, service IA), utiliser le `docker-compose.yml` à la racine du dépôt.

## SQLite ou PostgreSQL

Le choix se fait dans `app/config.py` via la variable `SQLALCHEMY_DATABASE_URI` :

```python
SQLALCHEMY_DATABASE_URI = "sqlite:///app.db"          # SQLite (développement)
SQLALCHEMY_DATABASE_URI = "postgresql://..."        # PostgreSQL (production)
```

En mode développement local, SQLite suffit. En production avec Docker Compose, utiliser PostgreSQL via le service `db` du docker-compose.

## Structure

```
backend/
├── app/
│   ├── __init__.py      # app factory, auto-chargement des modules
│   ├── config.py        # configuration Flask
│   ├── extensions.py    # SQLAlchemy, CORS
│   ├── crud.py          # helper CRUD générique
│   ├── models/          # un fichier par modèle (auto-découverte)
│   │   ├── project.py   # Student, Project
│   │   ├── professor.py # Professor, Availability
│   │   └── defense.py   # Defense, JuryMember
│   └── routes/          # un fichier par route (auto-découverte)
│       ├── students.py
│       ├── projects.py
│       ├── professors.py
│       ├── defenses.py
│       └── ai.py        # proxy vers le service IA
├── tests/
│   └── test_api.py      # tests pytest
├── requirements.txt
└── Dockerfile
```

## Ajouter un modèle ou une route

Créer un fichier dans `app/models/` ou `app/routes/`. Les modules sont chargés automatiquement sans modifier `__init__.py` :

```python
# app/models/exemple.py
from ..extensions import db

class Exemple(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(80))
```

```python
# app/routes/exemple.py
from ..crud import crud_blueprint
from ..models.exemple import Exemple

bp = crud_blueprint("exemples", Exemple, ["nom"])
```

## Commandes utiles

| Commande | Rôle |
| --- | --- |
| `flask --app "app:create_app" run` | serveur de développement |
| `pytest` | tests de l'API |
| `docker build -t pfe-backend .` | build Docker |

## Endpoints

Étudiants, Projets PFE, Professeurs (avec disponibilités), Soutenances (planification et détection des conflits), Recommandation de jury (proxy IA).
