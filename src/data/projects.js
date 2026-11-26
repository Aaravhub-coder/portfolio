export const PROJECTS = [
  {
    id: 'ai-fake-stock-detector',
    title: 'AI Fake Stock Detector',
    subtitle: 'Financial Anomaly Detection',
    worldTitle: 'Financial Data Universe',
    worldMetaphor:
      'Financial data universe with market graphs and glowing anomaly signals.',
    accent: '#E7BD72',
    status: 'CV Project',
    problem:
      'Help surface unusual stock-market price and trading-volume behaviour to support financial-risk awareness for retail investors.',
    highlights: [
      'Processed stock-market data and engineered features to examine price movements and trading-volume behaviour.',
      'Calculated Z-scores and implemented Isolation Forest to flag potentially unusual price or volume patterns.',
      'Combined statistical and ML-based anomaly detection to identify potentially suspicious market activity.',
      'Presented detection outputs to support financial-risk awareness for retail investors.',
    ],
    technologies: [
      'Python',
      'Pandas',
      'NumPy',
      'Scikit-learn',
      'Isolation Forest',
      'Z-Score Statistics',
    ],
    recognition: null,
    repoUrl: null,
  },
  {
    id: 'business-entity-resolution',
    title: 'Business Entity Resolution',
    subtitle: 'Multi-Source Business Matching',
    worldTitle: 'Data-Matching Laboratory',
    worldMetaphor:
      'Data-matching laboratory with linked records and glowing entity nodes.',
    accent: '#83D9DC',
    status: 'CV / Hackathon Project',
    problem:
      'Resolve inconsistent business records across large multi-source datasets using candidate retrieval and supervised matching.',
    highlights: [
      'Loaded large business datasets and organized training, validation, and ground-truth workflows.',
      'Normalized business names, addresses, and country fields to reduce inconsistencies across records.',
      'Retrieved candidate matches using character-level TF-IDF and cosine-similarity nearest-neighbour search.',
      'Built a matching pipeline using engineered features and XGBoost to predict matches and generate structured outputs.',
      'Explored candidate blocking, similarity matching, and F0.5-oriented threshold optimization in the Amazon ML Challenge context (Team CodeBlooded).',
    ],
    technologies: [
      'Python',
      'Pandas',
      'Scikit-learn',
      'Character TF-IDF',
      'XGBoost',
      'AWS SageMaker',
      'Amazon S3',
    ],
    recognition: 'Participant — AWS Machine Learning Hackathon',
    repoUrl: null,
  },
  {
    id: 'solarquest',
    title: 'SolarQuest',
    subtitle: 'Intelligent Solar Recommendation App',
    worldTitle: 'Solar Planet',
    worldMetaphor:
      'Sunlit orbital planet with stylized rooftop solar arrays and warm golden rays.',
    accent: '#E7BD72',
    status: 'CV / Hackathon Project',
    problem:
      'Help users explore rooftop solar suitability by turning roof area and geographical location into actionable recommendations.',
    highlights: [
      'Developed an Android application using roof area and geographical location as user inputs.',
      'Processed user inputs through the solar recommendation workflow.',
      'Integrated an intelligent recommendation model with the application for solar suitability assessment.',
      'Presented solar-related recommendations to help users explore rooftop solar solutions.',
    ],
    technologies: ['Android', 'Python', 'Machine Learning'],
    recognition:
      'Runner-Up — GNA University Hackathon 4.0 (Clean and Green Technologies)',
    repoUrl: null,
  },
  {
    id: 'sangyan-shield',
    title: 'SANGYAN Shield',
    subtitle: 'Cybersecurity Detection App',
    worldTitle: 'Cybersecurity Fortress',
    worldMetaphor:
      'Geometric shield fortress with protective rings and safe data visualization.',
    accent: '#83D9DC',
    status: 'CV / Hackathon Project',
    problem:
      'Enable users to submit screenshots from a mobile workflow to a backend cybersecurity analysis pipeline.',
    highlights: [
      'Developed a cross-platform mobile workflow for submitting inputs to a cybersecurity detection engine.',
      'Integrated the mobile interface with a Python FastAPI backend for communication with the analysis pipeline.',
      'Connected screenshot-upload and analysis workflows for backend request handling and model-driven processing.',
      'Tested image uploads, backend requests, and returned analysis responses while troubleshooting integration issues.',
    ],
    technologies: ['Python', 'FastAPI', 'Cross-Platform Mobile', 'REST API'],
    recognition: 'Top 100 — SANGYAN Hackathon, IIT (BHU)',
    repoUrl: null,
  },
  {
    id: 'chandrayaan-2-image-correspondence',
    title: 'Chandrayaan-2 Image Correspondence',
    subtitle: 'Multi-Modal Lunar Imagery Research Direction',
    worldTitle: 'Lunar Research Station',
    worldMetaphor:
      'Minimal lunar terrain horizon and orbital research station scanning surface contours.',
    accent: '#E7BD72',
    status: 'Research Direction / Proposed Pipeline',
    problem:
      'Explore sun-angle and scale-invariant image correspondence across Chandrayaan-2 optical sensors (OHRC, TMC, IIRS) under changing illumination and viewpoint.',
    highlights: [
      'Investigated multi-modal, sun-angle, and scale-invariant image correspondence challenges using Chandrayaan-2 optical imagery.',
      'Studied sensor data sources including OHRC, TMC, and IIRS under illumination, viewpoint, and scale variation.',
      'Outlined a proposed pipeline covering photometric normalization, structural filtering, keypoint detection, feature matching, and sub-pixel refinement.',
    ],
    technologies: ['Python', 'Computer Vision Concepts', 'OHRC / TMC / IIRS'],
    recognition: null,
    repoUrl:
      'https://github.com/Aaravhub-coder/Multi-modal-Sun-angle-and-scale-invariant-image-correspondence-using-Chandrayaan-2-optical-images-',
  },
  {
    id: 'skillhub',
    title: 'SkillHub',
    subtitle: 'Python & Database-Backed Web Project',
    worldTitle: 'Builder’s Workshop',
    worldMetaphor:
      'Illuminated digital workshop with modular glowing blueprint constructs.',
    accent: '#83D9DC',
    status: 'Web Project',
    problem:
      'Build a structured full-stack web project backed by Python, Flask, and a relational database layer.',
    highlights: [
      'Built a website project using Flask and SQLAlchemy.',
      'Implemented Python backend routes and database-backed application functionality.',
    ],
    technologies: ['Python', 'Flask', 'SQLAlchemy', 'SQL'],
    recognition: null,
    repoUrl: null,
  },
];
