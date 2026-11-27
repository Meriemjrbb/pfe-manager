import { useEffect, useState } from "react";
import { api } from "../api";

export const meta = { path: "/defenses", label: "Soutenances", order: 4 };
const ROLES = ["président", "examinateur", "encadrant"];
const empty = { project_id: "", room: "", start: "", end: "", members: [{ professor_id: "", role: "président" }, { professor_id: "", role: "examinateur" }] };

export default function Defenses() {
  const [defenses, setDefenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [profs, setProfs] = useState([]);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState([]);

  const load = () => {
    api.get("/defenses").then(setDefenses);
    api.get("/defenses/ready-projects").then(setProjects);
  };
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
  const name = (id) => { const p = profs.find((x) => x.id === id); return p ? `${p.first_name} ${p.last_name}` : id; };
  const title = (id) => projects.find((p) => p.id === id)?.title || `Projet #${id}`;

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
      <div className="card">
        <h3>Calendrier global</h3>
        <table>
          <thead><tr><th>Date</th><th>Salle</th><th>Projet</th><th>Jury</th><th /></tr></thead>
          <tbody>
            {defenses.map((d) => (
              <tr key={d.id}>
                <td>{d.start.replace("T", " ")} → {d.end.slice(11, 16)}</td><td>{d.room}</td><td>{title(d.project_id)}</td>
                <td>{d.members.map((m) => `${name(m.professor_id)} (${m.role})`).join(", ")}</td>
                <td><button className="danger" onClick={async () => { await api.del(`/defenses/${d.id}`); load(); }}>Supprimer</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}