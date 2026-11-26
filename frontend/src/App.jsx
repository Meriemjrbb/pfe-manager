import { NavLink, Navigate, Route, Routes } from "react-router-dom";

// Chaque fichier de src/pages exporte `meta` ({ path, label, order }) et un composant par défaut.
const pages = Object.values(import.meta.glob("./pages/*.jsx", { eager: true }))
  .filter((m) => m.meta)
  .sort((a, b) => a.meta.order - b.meta.order);

export default function App() {
  return (
    <div className="layout">
      <nav>
        <h1>PFE Manager</h1>
        {pages.map((p) => (
          <NavLink key={p.meta.path} to={p.meta.path}>{p.meta.label}</NavLink>
        ))}
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to={pages[0]?.meta.path || "/"} />} />
          {pages.map((p) => (
            <Route key={p.meta.path} path={p.meta.path} element={<p.default />} />
          ))}
        </Routes>
      </main>
    </div>
  );
}