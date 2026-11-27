from ..extensions import db


class Defense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.ForeignKey("project.id"), nullable=False, unique=True)
    start = db.Column(db.DateTime, nullable=False)
    end = db.Column(db.DateTime, nullable=False)
    room = db.Column(db.String(60), nullable=False)
    members = db.relationship("JuryMember", backref="defense", cascade="all, delete-orphan")

    def to_dict(self):
        return {"id": self.id, "project_id": self.project_id, "room": self.room,
                "start": self.start.isoformat(), "end": self.end.isoformat(),
                "members": [{"professor_id": m.professor_id, "role": m.role} for m in self.members]}


class JuryMember(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    defense_id = db.Column(db.ForeignKey("defense.id"), nullable=False)
    professor_id = db.Column(db.ForeignKey("professor.id"), nullable=False)
    role = db.Column(db.String(30), nullable=False)  # président | examinateur | encadrant
