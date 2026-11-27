from ..crud import crud_blueprint
from ..models.project import Student

bp = crud_blueprint("students", Student, ["first_name", "last_name", "email", "level"])
