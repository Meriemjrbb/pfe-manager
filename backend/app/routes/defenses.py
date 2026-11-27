from datetime import datetime

from flask import Blueprint, jsonify, request

from ..extensions import db
from ..models.defense import Defense, JuryMember
from ..models.professor import Availability
from ..models.project import Project

bp = Blueprint("defenses", __name__, url_prefix="/api/defenses")
ROLES = {"président", "examinateur", "encadrant"}


def check(data, exclude_id=None):
    """Retourne la liste des erreurs/conflits pour une soutenance proposée."""
    errors = []
    start, end = datetime.fromisoformat(data["start"]), datetime.fromisoformat(data["end"])
    members = data.get("members", [])
    if end <= start:
        errors.append("L'heure de fin doit être après l'heure de début.")
    roles = [m["role"] for m in members]
    if any(r not in ROLES for r in roles):
        errors.append("Rôle de jury invalide.")
    if roles.count("président") != 1 or "examinateur" not in roles:
        errors.append("Le jury doit avoir un président et au moins un examinateur.")
    if len({m["professor_id"] for m in members}) != len(members):
        errors.append("Un professeur ne peut apparaître qu'une fois dans le jury.")
    overlap = [Defense.start < end, Defense.end > start]
    if exclude_id:
        overlap.append(Defense.id != exclude_id)
    if Defense.query.filter(Defense.room == data["room"], *overlap).first():
        errors.append(f"La salle {data['room']} est déjà occupée sur ce créneau.")
    for m in members:
        pid = m["professor_id"]
        if not Availability.query.filter(Availability.professor_id == pid, Availability.start <= start,
                                         Availability.end >= end).first():
            errors.append(f"Le professeur {pid} n'est pas disponible sur ce créneau.")
        busy = (Defense.query.join(JuryMember).filter(JuryMember.professor_id == pid, *overlap).first())
        if busy:
            errors.append(f"Le professeur {pid} participe déjà à la soutenance {busy.id} sur ce créneau.")
    return errors


def save(defense, data):
    defense.project_id = data["project_id"]
    defense.start = datetime.fromisoformat(data["start"])
    defense.end = datetime.fromisoformat(data["end"])
    defense.room = data["room"]
    defense.members = [JuryMember(professor_id=m["professor_id"], role=m["role"]) for m in data["members"]]


@bp.get("/")
def calendar():
    return jsonify([d.to_dict() for d in Defense.query.order_by(Defense.start).all()])


@bp.get("/ready-projects")
def ready_projects():
    planned = [d.project_id for d in Defense.query.all()]
    return jsonify([p.to_dict() for p in Project.query.filter(~Project.id.in_(planned)).all()])


@bp.post("/")
def create():
    data = request.get_json() or {}
    errors = check(data)
    if errors:
        return jsonify({"errors": errors}), 409
    d = Defense()
    save(d, data)
    db.session.add(d)
    db.session.commit()
    return jsonify(d.to_dict()), 201


@bp.put("/<int:i>")
def update(i):
    d, data = db.get_or_404(Defense, i), request.get_json() or {}
    errors = check(data, exclude_id=i)
    if errors:
        return jsonify({"errors": errors}), 409
    save(d, data)
    db.session.commit()
    return jsonify(d.to_dict())


@bp.delete("/<int:i>")
def delete(i):
    db.session.delete(db.get_or_404(Defense, i))
    db.session.commit()
    return "", 204
