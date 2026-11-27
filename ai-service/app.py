import json
import os
import re

import requests
from flask import Flask, jsonify, request

app = Flask(__name__)
API_KEY = os.getenv("LLM_API_KEY", "")
MODEL = os.getenv("LLM_MODEL", "claude-sonnet-5-5")

PROMPT = """Tu aides un service administratif universitaire à composer un jury de soutenance PFE.
Projet : {project}
Professeurs disponibles : {professors}
Contraintes : {constraints}
Analyse le projet, identifie les compétences requises et compare-les aux professeurs.
Réponds uniquement en JSON :
{{"required_skills": ["compétence"],
 "recommendations": [{{"professor_id": 1, "score": 0, "reason": "explication courte"}}],
 "jury": {{"president": null, "examiner": null, "supervisor": null}}}}"""


@app.get("/health")
def health():
    return {"status": "ok"}


def call_llm(payload):
    prompt = PROMPT.format(
        project=json.dumps(payload["project"], ensure_ascii=False),
        professors=json.dumps(payload["professors"], ensure_ascii=False),
        constraints=payload.get("constraints") or "aucune",
    )
    response = requests.post(
        "https://api.anthropic.com/v1/messages",
        timeout=60,
        headers={
            "x-api-key": API_KEY,
            "anthropic-version": "2023-06-01",
        },
        json={
            "model": MODEL,
            "max_tokens": 1500,
            "messages": [{"role": "user", "content": prompt}],
        },
    )
    response.raise_for_status()
    content = response.json().get("content", [])
    text = "".join(
        block.get("text", "") for block in content if isinstance(block, dict)
    )
    match = re.search(r"\{.*\}", text, re.S)
    if match is None:
        raise ValueError("La réponse du LLM ne contient pas de JSON.")
    result = json.loads(match.group(0))
    if not isinstance(result, dict):
        raise ValueError("La réponse du LLM doit être un objet JSON.")
    return result


@app.post("/recommend")
def recommend():
    payload = request.get_json(silent=True)
    if (
        not isinstance(payload, dict)
        or not isinstance(payload.get("project"), dict)
        or not isinstance(payload.get("professors"), list)
    ):
        return jsonify({"error": "Le projet et la liste des professeurs sont requis."}), 400

    if not API_KEY:
        return jsonify({"error": "LLM_API_KEY n'est pas configurée."}), 503

    try:
        result = call_llm(payload)
    except (requests.RequestException, ValueError) as error:
        app.logger.warning("Échec de l'appel LLM : %s", error)
        return jsonify({"error": "Le service LLM n'a pas pu traiter la demande."}), 502

    return jsonify({**result, "source": "llm"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
