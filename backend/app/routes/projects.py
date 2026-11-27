from ..crud import crud_blueprint
from ..models.project import Project, Student


def set_students(project, data):
    if "student_ids" in data:
        project.students = Student.query.filter(Student.id.in_(data["student_ids"])).all()


bp = crud_blueprint("projects", Project,
                    ["title", "description", "technologies", "status", "progress"], set_students)
