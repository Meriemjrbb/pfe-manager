from datetime import datetime

from flask import jsonify, request

from ..crud import crud_blueprint
from ..extensions import db
from ..models.professor import Availability, Professor

bp = crud_blueprint("professors", Professor, ["first_name", "last_name", "email", "specialty", "skills"])


@bp.post("/<int:i>/availabilities")
def add_availability(i):
    db.get_or_404(Professor, i)
    d = request.get_json() or {}
    a = Availability(professor_id=i, start=datetime.fromisoformat(d["start"]),
                     end=datetime.fromisoformat(d["end"]))
    db.session.add(a)
    db.session.commit()
    return jsonify(a.to_dict()), 201


@bp.delete("/availabilities/<int:a_id>")
def delete_availability(a_id):
    db.session.delete(db.get_or_404(Availability, a_id))
    db.session.commit()
    return "", 204
