// Données statiques utilisées tant que le backend est soit prêt.

export const mockData = {
  students: [
    { id: 1, first_name: "Sara", last_name: "Ben Ali", email: "sara@isimg.tn", level: "3e année ingénieur" },
    { id: 2, first_name: "Yassine", last_name: "Trabelsi", email: "yassine@isimg.tn", level: "3e année ingénieur" },
    { id: 3, first_name: "Nour", last_name: "Mansour", email: "nour@isimg.tn", level: "Master" },
  ],
  projects: [
    { id: 1, title: "Application de gestion RH", description: "Gestion des congés et des employés",
      technologies: "React, Flask, PostgreSQL", status: "Prêt pour soutenance", progress: 100, student_ids: [1] },
    { id: 2, title: "Plateforme e-learning", description: "Cours en ligne avec suivi des étudiants",
      technologies: "Vue.js, Laravel, MySQL", status: "En cours", progress: 60, student_ids: [2, 3] },
  ],
  professors: [
    { id: 1, first_name: "Mahmoud", last_name: "Gharbi", email: "m.gharbi@isimg.tn", specialty: "Génie logiciel",
      skills: "React, Flask, DevOps",
      availabilities: [{ id: 1, professor_id: 1, start: "2026-12-15T09:00:00", end: "2026-12-15T12:00:00" }] },
    { id: 2, first_name: "Leila", last_name: "Hamdi", email: "l.hamdi@isimg.tn", specialty: "Bases de données",
      skills: "PostgreSQL, MySQL, Laravel", availabilities: [] },
    { id: 3, first_name: "Karim", last_name: "Jlassi", email: "k.jlassi@isimg.tn", specialty: "Intelligence artificielle",
      skills: "Python, Deep Learning, NLP", availabilities: [] },
  ],
  defenses: [],
};