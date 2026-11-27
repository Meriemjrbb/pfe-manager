from ..extensions import db


class Professor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True)
    specialty = db.Column(db.String(120), default="")
    skills = db.Column(db.String(300), default="")  # compétences séparées par des virgules
    availabilities = db.relationship("Availability", backref="professor", cascade="all, delete-orphan")

    def to_dict(self):
        return {"id": self.id, "first_name": self.first_name, "last_name": self.last_name,
                "email": self.email, "specialty": self.specialty, "skills": self.skills,
                "availabilities": [a.to_dict() for a in self.availabilities]}


class Availability(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    professor_id = db.Column(db.ForeignKey("professor.id"), nullable=False)
    start = db.Column(db.DateTime, nullable=False)
    end = db.Column(db.DateTime, nullable=False)

    def to_dict(self):
        return {"id": self.id, "professor_id": self.professor_id,
                "start": self.start.isoformat(), "end": self.end.isoformat()}
