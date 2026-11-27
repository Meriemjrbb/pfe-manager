import Crud from "../components/Crud";

export const meta = { path: "/students", label: "Étudiants", order: 1 };

export default function Students() {
  return (
    <Crud resource="students" title="Étudiants"
      fields={[
        { name: "first_name", label: "Prénom" }, { name: "last_name", label: "Nom" },
        { name: "email", label: "Email", type: "email" }, { name: "level", label: "Niveau" },
      ]}
      columns={[
        { label: "Nom", render: (r) => `${r.first_name} ${r.last_name}` },
        { label: "Email", key: "email" }, { label: "Niveau", key: "level" },
      ]} />
  );
}