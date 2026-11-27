import Crud from "../components/Crud";

export const meta = { path: "/professors", label: "Professeurs", order: 3 };

export default function Professors() {
  return (
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
  );
}