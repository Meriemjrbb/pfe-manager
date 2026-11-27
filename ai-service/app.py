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


def tokens(text):
    return set(re.findall(r"\w{3,}", str(text or "").lower()))


def heuristic(project, professors):
    need = tokens(" ".join(
        str(project.get(field) or "")
        for field in ("title", "description", "technologies")
    ))
    ranked = []

    for professor in professors:
        have = tokens(
            f"{professor.get('specialty', '')} {professor.get('skills', '')}"
        )
        common = need & have
        score = round(100 * len(common) / max(len(have), 1))
        ranked.append({
            "professor_id": professor["id"],
            "score": score,
            "reason": "Compétences communes : "
            + (", ".join(sorted(common)) or "aucune"),
        })

    ranked.sort(key=lambda recommendation: -recommendation["score"])
    professor_ids = [item["professor_id"] for item in ranked]

    return {
        "required_skills": sorted(need)[:10],
        "recommendations": ranked,
        "jury": {
            "president": professor_ids[0] if len(professor_ids) > 0 else None,
            "examiner": professor_ids[1] if len(professor_ids) > 1 else None,
            "supervisor": professor_ids[2] if len(professor_ids) > 2 else None,
        },
    }


@app.post("/recommend")
def recommend():
    payload = request.get_json(silent=True)
    if (
        not isinstance(payload, dict)
        or not isinstance(payload.get("project"), dict)
        or not isinstance(payload.get("professors"), list)
        or any(
            not isinstance(professor, dict) or professor.get("id") is None
            for professor in payload.get("professors", [])
        )
    ):
        return jsonify({"error": "Le projet et la liste des professeurs sont requis."}), 400

    if API_KEY:
        try:
            result = call_llm(payload)
        except (requests.RequestException, ValueError) as error:
            app.logger.warning("Échec de l'appel LLM, repli heuristique : %s", error)
        else:
            return jsonify({**result, "source": "llm"})

    return jsonify({
        **heuristic(payload["project"], payload["professors"]),
        "source": "fallback",
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
