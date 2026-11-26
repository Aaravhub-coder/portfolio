export const SKILL_CATEGORIES = [
  {
    id: 'languages',
    title: 'Languages',
    description: 'Core programming and query languages listed on Aarav’s CV.',
    items: [
      { name: 'Python', familiarity: 'Core' },
      { name: 'SQL', familiarity: 'Core' },
    ],
  },
  {
    id: 'frameworks-tools',
    title: 'Frameworks & Tools',
    description: 'Development, analysis, and machine learning toolset used across coursework and projects.',
    items: [
      { name: 'Git / GitHub', familiarity: 'Used in projects' },
      { name: 'VS Code', familiarity: 'Daily environment' },
      { name: 'Jupyter Notebook', familiarity: 'Used in projects' },
      { name: 'Pandas', familiarity: 'Used in projects' },
      { name: 'NumPy', familiarity: 'Used in projects' },
      { name: 'Scikit-learn', familiarity: 'Used in projects' },
    ],
  },
  {
    id: 'data-science-ai',
    title: 'Data Science & AI',
    description: 'Analytical foundations and machine learning areas currently pursued.',
    items: [
      { name: 'Exploratory Data Analysis (EDA)', familiarity: 'Core focus' },
      { name: 'Data Analysis', familiarity: 'Core focus' },
      { name: 'Machine Learning Concepts', familiarity: 'Core focus' },
      { name: 'TensorFlow', familiarity: 'Currently learning' },
    ],
  },
  {
    id: 'project-technologies',
    title: 'Applied in Projects & Hackathons',
    description: 'Technologies applied in documented CV project work and hackathon prototypes.',
    items: [
      { name: 'Isolation Forest', familiarity: 'Used in projects' },
      { name: 'XGBoost', familiarity: 'Used in projects' },
      { name: 'TF-IDF & Nearest-Neighbour Search', familiarity: 'Used in projects' },
      { name: 'FastAPI', familiarity: 'Used in projects' },
      { name: 'Flask & SQLAlchemy', familiarity: 'Used in projects' },
      { name: 'AWS SageMaker & Amazon S3', familiarity: 'Hackathon context' },
    ],
  },
];
