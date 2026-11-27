import requests
from flask import Blueprint, current_app, jsonify, request

from ..extensions import db
from ..models.professor import Professor
from ..models.project import Project

bp = Blueprint("ai", __name__, url_prefix="/api/ai")


@bp.post("/recommend")
def recommend():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Un objet JSON est requis."}), 400

    project_id = data.get("project_id")
    if not isinstance(project_id, int) or isinstance(project_id, bool):
        return jsonify({"error": "project_id doit être un entier."}), 400

    project = db.get_or_404(Project, project_id)
    payload = {
        "project": {
            "title": project.title,
            "description": project.description,
            "technologies": project.technologies,
        },
        "professors": [
            {
                "id": professor.id,
                "name": f"{professor.first_name} {professor.last_name}",
                "specialty": professor.specialty,
                "skills": professor.skills,
            }
            for professor in Professor.query.all()
        ],
        "constraints": data.get("constraints", ""),
    }

    try:
        response = requests.post(
            f"{current_app.config['AI_SERVICE_URL'].rstrip('/')}/recommend",
            json=payload,
            timeout=60,
        )
    except requests.RequestException as error:
        current_app.logger.warning("Service IA indisponible : %s", error)
        return jsonify({"error": "Service IA indisponible."}), 502

    try:
        result = response.json()
    except ValueError as error:
        current_app.logger.warning("Réponse JSON invalide du service IA : %s", error)
        return jsonify({"error": "Réponse invalide du service IA."}), 502

    if not isinstance(result, dict):
        return jsonify({"error": "Réponse invalide du service IA."}), 502

    return jsonify(result), response.status_code
