import Crud from "../components/Crud";

export const meta = { path: "/projects", label: "Projets PFE", order: 2 };

export default function Projects() {
  return (
    <Crud resource="projects" title="Projets PFE"
      fields={[
        { name: "title", label: "Titre" },
        { name: "technologies", label: "Technologies / compétences (virgules)" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "status", label: "Statut (En cours, Prêt pour soutenance…)" },
        { name: "progress", label: "Avancement (%)", type: "number" },
        { name: "student_ids", label: "Étudiants", multi: true, source: "/students",
          optLabel: (s) => `${s.first_name} ${s.last_name}` },
      ]}
      columns={[
        { label: "Titre", key: "title" }, { label: "Technologies", key: "technologies" },
        { label: "Statut", render: (r) => <span className="badge">{r.status}</span> },
        { label: "Avancement", render: (r) => `${r.progress}%` },
        { label: "Étudiants", render: (r) => r.student_ids.length },
      ]} />
  );
}