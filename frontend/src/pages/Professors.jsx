import { useEffect, useState } from "react";
import Crud from "../components/Crud";
import { api } from "../api";

export const meta = { path: "/professors", label: "Professeurs", order: 3 };

function Availabilities() {
  const [profs, setProfs] = useState([]);
  const [pid, setPid] = useState("");
  const [slot, setSlot] = useState({ start: "", end: "" });
  const load = () => api.get("/professors").then(setProfs);
  useEffect(() => { load(); }, []);
  const prof = profs.find((p) => String(p.id) === pid);
  const add = async () => { await api.post(`/professors/${pid}/availabilities`, slot); load(); };
  const del = async (id) => { await api.del(`/professors/availabilities/${id}`); load(); };

  return (
    <div className="card">
      <h3>Disponibilités pour les soutenances</h3>
      <div className="grid" style={{ display: "grid", gap: ".7rem", gridTemplateColumns: "repeat(4, 1fr)" }}>
        <select value={pid} onChange={(e) => setPid(e.target.value)}>
          <option value="">Professeur…</option>
          {profs.map((p) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
        </select>
        <input type="datetime-local" onChange={(e) => setSlot({ ...slot, start: e.target.value })} />
        <input type="datetime-local" onChange={(e) => setSlot({ ...slot, end: e.target.value })} />
        <button disabled={!pid || !slot.start || !slot.end} onClick={add}>Ajouter un créneau</button>
      </div>
      <ul>
        {prof?.availabilities.map((a) => (
          <li key={a.id}>{a.start.replace("T", " ")} → {a.end.replace("T", " ")}{" "}
            <button className="danger" onClick={() => del(a.id)}>×</button></li>
        ))}
      </ul>
    </div>
  );
}

export default function Professors() {
  return (
    <>
      <Crud resource="professors" title="Professeurs"
        fields={[
          { name: "first_name", label: "Prénom" }, { name: "last_name", label: "Nom" },
          { name: "email", label: "Email", type: "email" }, { name: "specialty", label: "Spécialité" },
          { name: "skills", label: "Compétences (virgules)" },
        ]}
        columns={[
          { label: "Nom", render: (r) => `${r.first_name} ${r.last_name}` },
          { label: "Spécialité", key: "specialty" }, { label: "Compétences", key: "skills" },
          { label: "Créneaux", render: (r) => r.availabilities.length },
        ]} />
      <Availabilities />
    </>
  );
}