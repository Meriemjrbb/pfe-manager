# Backend API – PFE Manager

Microservice Flask RESTful assurant la gestion des données métier : étudiants, projets, professeurs, disponibilités et soutenances. Base de données PostgreSQL (SQLite en développement), CORS activé, tests pytest.

## Architecture

Le backend suit une architecture modulaire avec auto-découverte des modules :

- **App Factory** : `app/__init__.py` instancie Flask, configure les extensions et charge dynamiquement les modèles et routes
- **Models** : `app/models/` contient les schémas SQLAlchemy (un fichier par entité)
- **Routes** : `app/routes/` contient les Blueprints Flask (un fichier par endpoint)
- **Extensions** : `app/extensions.py` initialise SQLAlchemy et CORS
- **CRUD Helper** : `app/crud.py` fournit un générateur d'endpoints CRUD standardisés

## Configuration

| Variable | Défaut | Description |
| --- | --- | --- |
| `SQLALCHEMY_DATABASE_URI` | `sqlite:///app.db` | URI de connexion à la base |
| `TESTING` | `False` | Mode test (SQLite en mémoire) |

## Installation

```bash
cd backend
pip install -r requirements.txt
```

**Dépendances principales** :
- Flask 3.0.3
- Flask-SQLAlchemy 3.1.1
- Flask-CORS 4.0.1
- psycopg2-binary 2.9.9 (PostgreSQL)
- gunicorn 22.0.0 (serveur WSGI)
- pytest 8.3.2 (tests)

## Lancement

### Développement local

```bash
flask --app "app:create_app" run
```

API : http://localhost:5000/api  
Healthcheck : http://localhost:5000/api/health

Pour PostgreSQL :
```bash
export SQLALCHEMY_DATABASE_URI="postgresql://user:pass@localhost/pfe"
flask --app "app:create_app" run
```

### Docker

```bash
docker build -t pfe-backend .
docker run --rm -p 5000:5000 pfe-backend
```

Pour l'orchestration complète (frontend + backend + IA), utiliser `docker-compose.yml` à la racine.

## Tests

```bash
pytest
```

Les tests utilisent une base SQLite en mémoire et ne nécessitent pas PostgreSQL. Couverture :

- CRUD étudiants et projets
- Gestion des disponibilités professeurs
- Détection des conflits de planification (salle, jury)

## Structure du projet

```
backend/
├── app/
│   ├── __init__.py          # app factory, auto-discovery
│   ├── config.py            # configuration Flask
│   ├── extensions.py        # SQLAlchemy, CORS
│   ├── crud.py              # générateur CRUD générique
│   ├── models/
│   │   ├── project.py       # Student, Project (relation many-to-many)
│   │   ├── professor.py     # Professor, Availability
│   │   └── defense.py       # Defense, JuryMember
│   └── routes/
│       ├── students.py      # /api/students
│       ├── projects.py      # /api/projects
│       ├── professors.py    # /api/professors, /api/professors/<id>/availabilities
│       ├── defenses.py      # /api/defenses, /api/defenses/ready-projects
│       └── ai.py            # /api/ai/recommend (proxy vers service IA)
├── tests/
│   └── test_api.py          # tests pytest
├── requirements.txt
└── Dockerfile
```

## Conventions de développement

- **Modèles** : un fichier par entité dans `app/models/`, exporte des classes SQLAlchemy
- **Routes** : un fichier par endpoint dans `app/routes/`, exporte un Blueprint `bp`
- **Auto-chargement** : ajouter un fichier dans `models/` ou `routes/` suffit pour qu'il soit chargé (pas de modification de `__init__.py`)
- **CRUD** : utiliser `crud_blueprint()` pour générer automatiquement les endpoints standard
- **Validation** : retourner 409 avec `{"errors": [...]}` en cas de conflit métier

## API Endpoints

| Route | Méthodes | Description |
| --- | --- | --- |
| `/api/health` | GET | Healthcheck |
| `/api/students` | GET, POST | Liste, création d'étudiants |
| `/api/students/<id>` | GET, PUT, DELETE | Détail, modification, suppression |
| `/api/projects` | GET, POST | Liste, création de projets |
| `/api/projects/<id>` | GET, PUT, DELETE | Détail, modification, suppression |
| `/api/professors` | GET, POST | Liste, création de professeurs |
| `/api/professors/<id>` | GET, PUT, DELETE | Détail, modification, suppression |
| `/api/professors/<id>/availabilities` | POST | Ajouter une disponibilité |
| `/api/defenses` | GET, POST | Liste, création de soutenances |
| `/api/defenses/<id>` | GET, PUT, DELETE | Détail, modification, suppression |
| `/api/defenses/ready-projects` | GET | Projets éligibles à la soutenance |
| `/api/ai/recommend` | POST | Recommandation de jury (proxy service IA) |

## Codes d'erreur

| Code | Condition |
| --- | --- |
| 200 | Succès |
| 201 | Ressource créée |
| 204 | Ressource supprimée |
| 404 | Ressource introuvable |
| 409 | Conflit métier (planning, disponibilités) |

## Déploiement

Le Dockerfile utilise Python 3.12-slim avec gunicorn (1 worker, 4 threads). En production, adapter la configuration selon la charge.
