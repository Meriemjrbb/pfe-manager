from flask import Blueprint, jsonify, request

from .extensions import db


def crud_blueprint(name, Model, fields, setter=None):
    """Blueprint CRUD générique : /api/<name>. `setter(obj, data)` gère les relations."""
    bp = Blueprint(name, __name__, url_prefix=f"/api/{name}")

    def apply(obj, data):
        for f in fields:
            if f in data:
                setattr(obj, f, data[f])
        if setter:
            setter(obj, data)

    @bp.get("/")
    def list_all():
        return jsonify([o.to_dict() for o in Model.query.order_by(Model.id).all()])

    @bp.get("/<int:i>")
    def get_one(i):
        return jsonify(db.get_or_404(Model, i).to_dict())

    @bp.post("/")
    def create():
        obj = Model()
        apply(obj, request.get_json() or {})
        db.session.add(obj)
        db.session.commit()
        return jsonify(obj.to_dict()), 201

    @bp.put("/<int:i>")
    def update(i):
        obj = db.get_or_404(Model, i)
        apply(obj, request.get_json() or {})
        db.session.commit()
        return jsonify(obj.to_dict())

    @bp.delete("/<int:i>")
    def delete(i):
        db.session.delete(db.get_or_404(Model, i))
        db.session.commit()
        return "", 204

    return bp
