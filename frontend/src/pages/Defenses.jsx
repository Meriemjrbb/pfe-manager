import { useEffect, useState } from "react";
import { api } from "../api";

export const meta = { path: "/defenses", label: "Soutenances", order: 4 };
const ROLES = ["président", "examinateur", "encadrant"];
const empty = { project_id: "", room: "", start: "", end: "", members: [{ professor_id: "", role: "président" }, { professor_id: "", role: "examinateur" }] };

export default function Defenses() {
  const [projects, setProjects] = useState([]);
  const [profs, setProfs] = useState([]);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState([]);

  const load = () => api.get("/defenses/ready-projects").then(setProjects);
  useEffect(() => { load(); api.get("/professors").then(setProfs); }, []);

  const setMember = (i, patch) =>
    setForm({ ...form, members: form.members.map((m, j) => (j === i ? { ...m, ...patch } : m)) });
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/defenses", {
        ...form, project_id: Number(form.project_id),
        members: form.members.filter((m) => m.professor_id).map((m) => ({ ...m, professor_id: Number(m.professor_id) })),
      });
      setForm(empty); setErrors([]); load();
    } catch (err) { setErrors(err?.errors || ["Erreur"]); }
  };

  return (
    <>
      <h2>Planification des soutenances</h2>
      <div className="card">
        {errors.map((e) => <div className="error" key={e}>{e}</div>)}
        <form className="grid" onSubmit={submit}>
          <label>Projet
            <select value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}>
              <option value="">Choisir…</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select></label>
          <label>Salle<input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></label>
          <label>Début<input type="datetime-local" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} /></label>
          <label>Fin<input type="datetime-local" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} /></label>
          {form.members.map((m, i) => (
            <label key={i}>Membre {i + 1}
              <div style={{ display: "flex", gap: ".3rem" }}>
                <select value={m.professor_id} onChange={(e) => setMember(i, { professor_id: e.target.value })}>
                  <option value="">Professeur…</option>
                  {profs.map((p) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                </select>
                <select value={m.role} onChange={(e) => setMember(i, { role: e.target.value })}>
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div></label>
          ))}
          <div style={{ display: "flex", gap: ".5rem", alignItems: "end" }}>
            <button type="button" className="light"
              onClick={() => setForm({ ...form, members: [...form.members, { professor_id: "", role: "encadrant" }] })}>+ Membre</button>
            <button type="submit">Planifier</button>
          </div>
        </form>
      </div>
    </>
  );
}