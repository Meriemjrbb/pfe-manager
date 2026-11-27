import { useEffect, useState } from "react";
import { api } from "../api";

/* Composant CRUD générique.
   fields: [{ name, label, type?: "text"|"number"|"textarea", multi?, source?, optLabel? }] */
export default function Crud({ resource, fields, columns, title }) {
  const [rows, setRows] = useState([]);
  const [sources, setSources] = useState({});
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  const load = () => api.get(`/${resource}`).then(setRows);
  useEffect(() => {
    load();
    fields.filter((f) => f.source).forEach((f) =>
      api.get(f.source).then((d) => setSources((s) => ({ ...s, [f.name]: d })))
    );
  }, []);

  const reset = () => { setForm({}); setEditId(null); setError(""); };
  const submit = async (e) => {
    e.preventDefault();
    try {
      editId ? await api.put(`/${resource}/${editId}`, form) : await api.post(`/${resource}`, form);
      reset(); load();
    } catch (err) { setError(err?.errors?.join(" ") || err?.message || "Erreur"); }
  };
  const remove = async (id) => { await api.del(`/${resource}/${id}`); load(); };

  const input = (f) => {
    const v = form[f.name] ?? (f.multi ? [] : "");
    if (f.multi)
      return (
        <select multiple value={v} onChange={(e) =>
          setForm({ ...form, [f.name]: [...e.target.selectedOptions].map((o) => Number(o.value)) })}>
          {(sources[f.name] || []).map((o) => <option key={o.id} value={o.id}>{f.optLabel(o)}</option>)}
        </select>
      );
    if (f.type === "textarea")
      return <textarea value={v} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />;
    return (
      <input type={f.type || "text"} value={v}
        onChange={(e) => setForm({ ...form, [f.name]: f.type === "number" ? Number(e.target.value) : e.target.value })} />
    );
  };

  return (
    <>
      <h2>{title}</h2>
      <div className="card">
        {error && <div className="error">{error}</div>}
        <form className="grid" onSubmit={submit}>
          {fields.map((f) => <label key={f.name}>{f.label}{input(f)}</label>)}
          <div style={{ display: "flex", gap: ".5rem", alignItems: "end" }}>
            <button type="submit">{editId ? "Modifier" : "Ajouter"}</button>
            {editId && <button type="button" className="light" onClick={reset}>Annuler</button>}
          </div>
        </form>
      </div>
      <div className="card">
        <table>
          <thead><tr>{columns.map((c) => <th key={c.label}>{c.label}</th>)}<th /></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                {columns.map((c) => <td key={c.label}>{c.render ? c.render(r) : r[c.key]}</td>)}
                <td style={{ textAlign: "right" }}>
                  <button className="light" onClick={() => { setForm(r); setEditId(r.id); }}>Éditer</button>{" "}
                  <button className="danger" onClick={() => remove(r.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}