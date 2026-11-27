import { useEffect, useState } from "react";
import { api } from "../api";

export const meta = { path: "/assistant", label: "Assistant IA", order: 5 };

export default function AIAssistant() {
  const [projects, setProjects] = useState([]);
  const [profs, setProfs] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [constraints, setConstraints] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.get("/projects").then(setProjects); api.get("/professors").then(setProfs); }, []);
  const name = (id) => { const p = profs.find((x) => x.id === id); return p ? `${p.first_name} ${p.last_name}` : "—"; };

  const run = async () => {
    setLoading(true); setError(""); setResult(null);
    try { setResult(await api.post("/ai/recommend", { project_id: Number(projectId), constraints })); }
    catch (e) { setError(e?.error || "Erreur lors de l'analyse"); }
    setLoading(false);
  };

  return (
    <>
      <h2>Assistant intelligent</h2>
      <div className="card">
        <label>Projet
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">Choisir…</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select></label>
        <label style={{ marginTop: ".7rem" }}>Contraintes (optionnel)
          <textarea value={constraints} onChange={(e) => setConstraints(e.target.value)}
            placeholder="Ex : éviter les professeurs du département X" /></label>
        <p><button disabled={!projectId || loading} onClick={run}>{loading ? "Analyse…" : "Recommander un jury"}</button></p>
        {error && <div className="error">{error}</div>}
      </div>
      {result && (
        <div className="card">
          <p><span className="badge">Source : {result.source}</span> Compétences requises : {result.required_skills?.join(", ")}</p>
          <h3>Jury proposé</h3>
          <p>Président : <b>{name(result.jury?.president)}</b> · Examinateur : <b>{name(result.jury?.examiner)}</b> · Encadrant : <b>{name(result.jury?.supervisor)}</b></p>
          <table>
            <thead><tr><th>Professeur</th><th>Score</th><th>Explication</th></tr></thead>
            <tbody>{result.recommendations?.map((r) => (
              <tr key={r.professor_id}><td>{name(r.professor_id)}</td><td>{r.score}</td><td>{r.reason}</td></tr>
            ))}</tbody>
          </table>
          <p><i>Ces recommandations doivent être validées par le service administratif (page Soutenances).</i></p>
        </div>
      )}
    </>
  );
}