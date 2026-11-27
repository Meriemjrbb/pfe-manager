import { mockData } from "./mock";

// true = données statiques (backend pas prêt) ; false = vrai backend sous /api
const USE_MOCK = false;

// ---------- Vrai backend ----------
async function realCall(url, opts = {}) {
  const res = await fetch("/api" + url, { headers: { "Content-Type": "application/json" }, ...opts });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw data || new Error(res.statusText);
  return data;
}

// ---------- Mode mock (en mémoire, perdu au rechargement) ----------
const db = structuredClone(mockData);
let nextId = 1000;
const reply = (value) => new Promise((r) => setTimeout(() => r(structuredClone(value)), 150));
const fail = (body) => Promise.reject(body);

function mockCall(url, { method = "GET", body } = {}) {
  const data = body ? JSON.parse(body) : {};
  const [, resource, a, b] = url.split("/");
  const id = Number(a);

  // Routes spéciales du contrat d'API
  if (resource === "defenses" && a === "ready-projects") {
    const planned = db.defenses.map((d) => d.project_id);
    return reply(db.projects.filter((p) => !planned.includes(p.id)));
  }
  if (resource === "professors" && b === "availabilities" && method === "POST") {
    const prof = db.professors.find((p) => p.id === id);
    const slot = { id: nextId++, professor_id: id, start: data.start, end: data.end };
    prof.availabilities.push(slot);
    return reply(slot);
  }
  if (resource === "professors" && a === "availabilities" && method === "DELETE") {
    db.professors.forEach((p) => {
      p.availabilities = p.availabilities.filter((s) => s.id !== Number(b));
    });
    return reply(null);
  }
  if (resource === "ai" && a === "recommend") {
    return reply({
      source: "mock",
      required_skills: ["React", "Flask"],
      jury: { president: 1, examiner: 3, supervisor: 2 },
      recommendations: db.professors.map((p, i) => ({
        professor_id: p.id, score: 90 - i * 15, reason: "Exemple de recommandation (données statiques).",
      })),
    });
  }

  // CRUD générique
  const rows = db[resource];
  if (!rows) return fail({ error: `Ressource inconnue : ${resource}` });
  if (method === "GET") return reply(a ? rows.find((r) => r.id === id) : rows);
  if (method === "POST") {
    if (resource === "defenses" && rows.some((d) => d.room === data.room && d.start < data.end && d.end > data.start))
      return fail({ errors: [`La salle ${data.room} est déjà occupée sur ce créneau.`] });
    const row = { ...data, id: nextId++ };
    if (resource === "professors") row.availabilities = [];
    if (resource === "projects") { row.student_ids ??= []; row.progress ??= 0; row.status ??= "En cours"; }
    rows.push(row);
    return reply(row);
  }
  if (method === "PUT") {
    const i = rows.findIndex((r) => r.id === id);
    rows[i] = { ...rows[i], ...data };
    return reply(rows[i]);
  }
  if (method === "DELETE") {
    rows.splice(rows.findIndex((r) => r.id === id), 1);
    return reply(null);
  }
}

const call = (url, opts) => (USE_MOCK ? mockCall(url, opts) : realCall(url, opts));

export const api = {
  get: (u) => call(u),
  post: (u, b) => call(u, { method: "POST", body: JSON.stringify(b) }),
  put: (u, b) => call(u, { method: "PUT", body: JSON.stringify(b) }),
  del: (u) => call(u, { method: "DELETE" }),
};