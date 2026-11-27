import pytest

from app import create_app


@pytest.fixture()
def client():
    app = create_app({"SQLALCHEMY_DATABASE_URI": "sqlite://", "TESTING": True})
    return app.test_client()


def make_prof(c, email, role_slot=True):
    p = c.post("/api/professors", json={"first_name": "P", "last_name": email, "email": email}).get_json()
    if role_slot:
        c.post(f"/api/professors/{p['id']}/availabilities",
               json={"start": "2026-06-10T08:00", "end": "2026-06-10T18:00"})
    return p["id"]


def test_students_and_projects(client):
    s = client.post("/api/students", json={"first_name": "A", "last_name": "B", "email": "a@x.tn"}).get_json()
    p = client.post("/api/projects", json={"title": "T", "student_ids": [s["id"]]}).get_json()
    assert p["student_ids"] == [s["id"]]
    assert client.delete(f"/api/students/{s['id']}").status_code == 204


def test_defense_conflicts(client):
    prj = client.post("/api/projects", json={"title": "T"}).get_json()
    prj2 = client.post("/api/projects", json={"title": "U"}).get_json()
    a, b = make_prof(client, "a@x.tn"), make_prof(client, "b@x.tn")
    body = {"project_id": prj["id"], "room": "S1", "start": "2026-06-10T09:00", "end": "2026-06-10T10:00",
            "members": [{"professor_id": a, "role": "président"}, {"professor_id": b, "role": "examinateur"}]}
    assert client.post("/api/defenses", json=body).status_code == 201
    r = client.post("/api/defenses", json={**body, "project_id": prj2["id"]})
    assert r.status_code == 409 and len(r.get_json()["errors"]) >= 2  # salle + jury occupés


def test_unavailable_professor(client):
    prj = client.post("/api/projects", json={"title": "T"}).get_json()
    a, b = make_prof(client, "a@x.tn", False), make_prof(client, "b@x.tn")
    body = {"project_id": prj["id"], "room": "S1", "start": "2026-06-10T09:00", "end": "2026-06-10T10:00",
            "members": [{"professor_id": a, "role": "président"}, {"professor_id": b, "role": "examinateur"}]}
    assert client.post("/api/defenses", json=body).status_code == 409
