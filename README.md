# PFE Manager

Plateforme de gestion des PFE et des soutenances (React, Flask, PostgreSQL, service IA LLM).

## Lancement
    cp .env.example .env      # renseigner LLM_API_KEY (optionnel)
    docker compose up --build
Application : http://localhost  ·  API : /api  ·  Santé : /api/health

## Développement local
    cd backend && pip install -r requirements.txt && flask --app "app:create_app" run
    cd ai-service && pip install -r requirements.txt && python app.py
    cd frontend && npm install && npm run dev

## Conventions
Chaque module backend = un fichier dans `app/models` ou `app/routes` (exporte `bp`).
Chaque page frontend = un fichier dans `src/pages` (exporte `meta` et un composant par défaut).
