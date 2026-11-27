from ..extensions import db

project_students = db.Table(
    "project_students",
    db.Column("project_id", db.ForeignKey("project.id"), primary_key=True),
    db.Column("student_id", db.ForeignKey("student.id"), primary_key=True),
)


class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True)
    level = db.Column(db.String(50))

    def to_dict(self):
        return {"id": self.id, "first_name": self.first_name, "last_name": self.last_name,
                "email": self.email, "level": self.level}


class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default="")
    technologies = db.Column(db.String(300), default="")  # liste séparée par des virgules
    status = db.Column(db.String(40), default="En cours")
    progress = db.Column(db.Integer, default=0)
    students = db.relationship("Student", secondary=project_students, backref="projects")

    def to_dict(self):
        return {"id": self.id, "title": self.title, "description": self.description,
                "technologies": self.technologies, "status": self.status,
                "progress": self.progress, "student_ids": [s.id for s in self.students]}
