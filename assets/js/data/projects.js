// REPLACE DEMO DATA HERE
/**
 * @typedef {Object} Metric
 * @property {string} label
 * @property {string} value
 * 
 * @typedef {Object} Artifact
 * @property {string} src
 * @property {string} alt
 * @property {string} caption
 * 
 * @typedef {Object} ThemeTokens
 * @property {string} sky
 * @property {string} accent
 * @property {string} lantern
 * 
 * @typedef {Object} ProjectStation
 * @property {string} id
 * @property {number} order
 * @property {string} station
 * @property {string} number
 * @property {string} category
 * @property {string} categoryKey
 * @property {string} title
 * @property {string} summary
 * @property {string} description
 * @property {'shipped'|'in-progress'|'archived'|'demo'} status
 * @property {boolean} isDemo
 * @property {boolean} featured
 * @property {boolean} hidden
 * @property {string[]} technologies
 * @property {{ heading: string, body: string }} spell
 * @property {{ heading: string, body: string, steps: string[] }} incantation
 * @property {{ summary: string, metrics: Metric[] }} result
 * @property {Artifact[]} artifacts
 * @property {string} reveal
 * @property {string|null} github
 * @property {string|null} demo
 * @property {ThemeTokens} theme
 */

/**
 * Validates project record at initialization time.
 * @param {ProjectStation} project
 */
export function validateProject(project) {
  const required = [
    'id', 'station', 'category', 'categoryKey', 'title', 
    'summary', 'description', 'status', 'technologies', 
    'spell', 'incantation', 'result', 'reveal', 'theme'
  ];
  for (const field of required) {
    if (project[field] === undefined || project[field] === null) {
      console.warn(`[validateProject] Missing required field "${field}" on project:`, project.id);
    }
  }
  if (!project.spell?.heading || !project.spell?.body) {
    console.warn(`[validateProject] Incomplete spell field on project:`, project.id);
  }
  if (!project.incantation?.heading || !Array.isArray(project.incantation?.steps)) {
    console.warn(`[validateProject] Incomplete incantation field on project:`, project.id);
  }
  if (!project.result?.summary || !Array.isArray(project.result?.metrics)) {
    console.warn(`[validateProject] Incomplete result field on project:`, project.id);
  }
}

/** @type {ProjectStation[]} */
const rawProjects = [
  {
    id: 'finacle',
    order: 1,
    station: 'FINACLE CORE',
    category: 'Enterprise Banking Core',
    categoryKey: 'banking',
    title: 'Finacle FNPR Enterprise Banking Core',
    summary: 'Tier-1 core banking engine powering global financial institutions. Engineered modules for Limits, Collaterals, and Covenants with dual-authorization approval pipelines.',
    description: 'Investigation confirmed active deployment on Finacle FNPR — one of the world’s leading Tier-1 core banking engines. The subject engineered mission-critical financial modules governing Credit Limits, Collaterals, and Covenant compliance. Implemented strict maker-checker multi-tiered approval pipelines to prevent unauthorized financial mutations. Successfully identified and eradicated 79 production defects while shipping 40+ client-ready enterprise enhancements.',
    status: 'shipped',
    isDemo: false,
    featured: true,
    hidden: false,
    technologies: ['Java 17', 'Spring Boot 3', 'PostgreSQL', 'Oracle DB', 'PL/SQL', 'Angular', 'OAuth2', 'RBAC'],
    spell: {
      heading: 'The Dark Defect Breaches',
      body: 'Critical transaction-level integrity vulnerabilities across Credit Limits, Collaterals, and Covenant compliance engines in global financial environments.'
    },
    incantation: {
      heading: 'Maker-Checker Multi-Tier Vault',
      body: 'Constructed dual-authorization pipelines, preventing unauthorized financial mutations and tuning relational SQL ledgers.',
      steps: [
        '1. Ingest Transaction Payload & Context',
        '2. Evaluate Dynamic Covenant Rules',
        '3. Enforce Dual Maker-Checker Signatures',
        '4. ACID Commit across Oracle & Postgres'
      ]
    },
    result: {
      summary: 'Eradicated 79 production defects and shipped 40+ client-ready business features worldwide.',
      metrics: [
        { label: 'Defects Eradicated', value: '79' },
        { label: 'Client Features', value: '40+' },
        { label: 'Approval Latency', value: '<15ms' },
        { label: 'Integrity Rate', value: '99.99%' }
      ]
    },
    artifacts: [
      {
        src: 'assets/images/projects/finacle.svg',
        alt: 'Finacle Banking Core Architecture',
        caption: 'Maker-checker dual authorization engine architecture'
      }
    ],
    reveal: 'Discovered unindexed ledger queries locking 1,200 concurrent threads; added partitioned B-tree index saving 450ms per transaction.',
    github: null,
    demo: null,
    theme: {
      sky: '#1a0b12',
      accent: '#d4af37',
      lantern: '#ffb703'
    }
  },
  {
    id: 'order-management',
    order: 3,
    station: 'ORDER MANAGEMENT',
    category: 'Full Stack & OMS',
    categoryKey: 'fullstack',
    title: 'EventGo High-Concurrency OMS Engine',
    summary: 'High-concurrency marketplace backend designed in NestJS & TypeScript. Engineered 25 REST APIs, 6+ relational schemas with automated Prisma ORM migrations, and webhook payment gateways.',
    description: 'Modular NestJS and TypeScript backend architecture designed for high-concurrency event bookings and artist discovery. Structured 6+ core relational database entities with automated Prisma ORM migrations. Integrated full Swagger/OpenAPI documentation and robust webhook handlers for transactional payments.',
    status: 'shipped',
    isDemo: true,
    featured: false,
    hidden: false,
    technologies: ['NestJS', 'TypeScript', 'Prisma ORM', 'PostgreSQL', 'JWT Authentication', 'Swagger', 'Stripe'],
    spell: {
      heading: 'The Ticketing Stampede',
      body: 'High-concurrency ticket release stampedes causing race conditions in seat reservations and payment double-charges.'
    },
    incantation: {
      heading: 'Atomic Transaction Queues',
      body: 'Engineered 25 REST APIs with automated Prisma ORM migrations, distributed locking, and idempotent payment webhooks.',
      steps: [
        '1. Validate JWT & Role Matrix',
        '2. Acquire Redis Distributed Lock',
        '3. Atomic Booking Reservation via Prisma',
        '4. Asynchronous Webhook Settlement'
      ]
    },
    result: {
      summary: 'Handled concurrent booking spikes with zero double-reservations and instant settlement.',
      metrics: [
        { label: 'Production APIs', value: '25' },
        { label: 'Relational Entities', value: '6+' },
        { label: 'Concurrency Spikes', value: '10k rps' },
        { label: 'Downtime', value: '0%' }
      ]
    },
    artifacts: [
      {
        src: 'assets/images/projects/order-management.svg',
        alt: 'Order Management Engine Schema',
        caption: 'Distributed transactional booking and payment architecture'
      }
    ],
    reveal: 'Implemented pessimistic row locking in Prisma transaction blocks to eliminate flash-sale ticket overbooking.',
    github: 'https://github.com/rishi-bhardvaj',
    demo: null,
    theme: {
      sky: '#0c1a24',
      accent: '#38bdf8',
      lantern: '#67e8f9'
    }
  },
  {
    id: 'risheesh',
    order: 5,
    station: 'RISHEESH',
    category: 'Automation & Intelligence',
    categoryKey: 'automation',
    title: 'Risheesh Autonomous Job Intelligence',
    summary: 'Autonomous scraping, classification, and heuristic matching engine that maps technical skill profiles to verified enterprise engineering vacancies.',
    description: 'Designed an automated intelligence pipeline eliminating job board noise. Employs headless crawlers, NLP semantic parsing of job descriptions, and custom heuristics to match candidate capabilities with active openings in real time.',
    status: 'shipped',
    isDemo: true,
    featured: false,
    hidden: false,
    technologies: ['Node.js', 'TypeScript', 'Python', 'PostgreSQL', 'Docker', 'REST API'],
    spell: {
      heading: 'The Ingestion Labyrinth',
      body: 'Fragmented job boards and opaque hiring signals create massive signal-to-noise friction for engineering applicants.'
    },
    incantation: {
      heading: 'Autonomous Ingestion & Matching Pipeline',
      body: 'Built an intelligent scraping, classification, and heuristic matching engine that maps tech stack profiles to verified engineering vacancies.',
      steps: [
        '1. Headless Crawling & Normalization',
        '2. Semantic Skills Vector Extraction',
        '3. Heuristic Compatibility Scoring',
        '4. Automated Daily Digest Dispatch'
      ]
    },
    result: {
      summary: 'Automated 95% of job curation workflows with sub-second matching queries.',
      metrics: [
        { label: 'Ingested Postings', value: '50k+' },
        { label: 'Match Precision', value: '94%' },
        { label: 'Workflow Automation', value: '95%' },
        { label: 'Dispatch Speed', value: '0.4s' }
      ]
    },
    artifacts: [
      {
        src: 'assets/images/projects/risheesh.svg',
        alt: 'Risheesh Automation Pipeline',
        caption: 'Data ingestion, vector parsing, and ranking pipeline'
      }
    ],
    reveal: 'Built custom rate-limiting backoff algorithms allowing 24/7 continuous data synchronization without IP blocks.',
    github: 'https://github.com/rishi-bhardvaj',
    demo: null,
    theme: {
      sky: '#160f24',
      accent: '#a855f7',
      lantern: '#c084fc'
    }
  },
  {
    id: 'devops-forge',
    order: 7,
    station: 'DEVOPS FORGE',
    category: 'DevOps & Infrastructure',
    categoryKey: 'devops',
    title: 'Enterprise CI/CD Acceleration Forge',
    summary: 'Parallelized test runner sharding and Docker artifact caching slashed pipeline runtimes from 120 minutes to 30 minutes across distributed build nodes.',
    description: 'Audited enterprise build and testing infrastructure suffering from severe bottleneck latency. Re-architected Jenkins and GitLab automation pipelines by introducing multi-stage Docker layer caching, parallelized unit/integration test sharding, and optimized artifact repository caching.',
    status: 'shipped',
    isDemo: false,
    featured: false,
    hidden: false,
    technologies: ['Jenkins', 'Docker', 'Kubernetes', 'GitLab CI', 'JUnit 5', 'Bash', 'Maven'],
    spell: {
      heading: 'The Two-Hour Build Bottleneck',
      body: 'Enterprise test and build pipelines languished at 120 minutes per merge request, crippling developer velocity.'
    },
    incantation: {
      heading: 'Parallel Runner Sharding & Layer Caching',
      body: 'Re-architected build stages with Docker multi-stage caching, parallel test sharding across distributed nodes, and automated lint gates.',
      steps: [
        '1. Multi-Stage Docker Layer Pre-Warm',
        '2. Parallel JUnit 5 Test Sharding',
        '3. Artifact Repository Cache Mounts',
        '4. Automated Security & Lint Gateways'
      ]
    },
    result: {
      summary: 'Slashed enterprise test and build execution times from 120 minutes down to 30 minutes (75% time reduction).',
      metrics: [
        { label: 'Runtime Reduction', value: '75%' },
        { label: 'Original Runtime', value: '120 min' },
        { label: 'Optimized Runtime', value: '30 min' },
        { label: 'Compute Savings', value: '4x' }
      ]
    },
    artifacts: [
      {
        src: 'assets/images/projects/devops-forge.svg',
        alt: 'CI/CD Pipeline Sharding',
        caption: 'Parallel runner nodes and Docker cache acceleration'
      }
    ],
    reveal: 'Identified redundant Maven dependency downloads per runner; implemented a shared PVC caching proxy saving 18 min per build.',
    github: 'https://github.com/rishi-bhardvaj',
    demo: null,
    theme: {
      sky: '#1e140d',
      accent: '#f97316',
      lantern: '#fb923c'
    }
  },
  {
    id: 'vision-lab',
    order: 8,
    station: 'VISION LAB',
    category: 'Research & Vision',
    categoryKey: 'research',
    title: 'Gait Analysis of Human Behaviour (IJRPR)',
    summary: 'Authored peer-reviewed paper in IJRPR exploring computer-vision and accelerometer sensor gait tracking models to classify human behavioral movements non-intrusively.',
    description: 'Authored and published a peer-reviewed research investigation in the International Journal of Research Publication and Reviews (IJRPR). The research explores computer-vision and sensor-driven gait tracking algorithms to identify distinctive human behavioral patterns without intrusive tracking sensors.',
    status: 'shipped',
    isDemo: false,
    featured: false,
    hidden: false,
    technologies: ['Python', 'OpenCV', 'Computer Vision', 'Biometric Signal Processing', 'Statistical Data Models'],
    spell: {
      heading: 'The Sensor Invasiveness Dilemma',
      body: 'Traditional behavioral motion analysis required invasive, expensive body-worn sensors prone to tracking noise and bias.'
    },
    incantation: {
      heading: 'Optical Flow & Kinematic Trajectory Extraction',
      body: 'Formulated non-intrusive computer vision extraction algorithms to model kinematic gait patterns under ambient illumination.',
      steps: [
        '1. Ambient Video Feed Ingestion',
        '2. Silhouette Contour Extraction',
        '3. Kinematic Feature Vector Normalization',
        '4. Classification via Statistical Model'
      ]
    },
    result: {
      summary: 'Published in peer-reviewed International Journal of Research Publication and Reviews (IJRPR), 2025.',
      metrics: [
        { label: 'Publication', value: "IJRPR '25" },
        { label: 'Tracking Accuracy', value: '96.2%' },
        { label: 'Sensor Intrusion', value: '0%' },
        { label: 'Frame Latency', value: '33ms' }
      ]
    },
    artifacts: [
      {
        src: 'assets/images/projects/vision-lab.svg',
        alt: 'Gait Kinematic Extraction',
        caption: 'Computer vision gait trajectory and kinematic modeling'
      }
    ],
    reveal: 'Normalizing cadence aspect-ratio against perspective distortion increased classification accuracy by 14%.',
    github: 'https://github.com/rishi-bhardvaj',
    demo: null,
    theme: {
      sky: '#0c1a17',
      accent: '#10b981',
      lantern: '#34d399'
    }
  },
  {
    id: 'marauders-archive',
    order: 9,
    station: "MARAUDER'S ARCHIVE",
    category: 'Experimental Systems',
    categoryKey: 'experimental',
    title: "Marauder's Interactive Engineering Sandbox",
    summary: 'A cinematic, zero-bundler interactive broadsheet & railway portfolio orchestrating complex state machines, GSAP context timelines, and synthesized audio.',
    description: 'Constructed an immersive, zero-bundler portfolio architecture blending linotype newspaper print aesthetics with a high-performance SVG railway simulation. Features native ES modules, reactive pub/sub state stores, WebAudio synthesis, and comprehensive accessibility hooks.',
    status: 'demo',
    isDemo: true,
    featured: false,
    hidden: false,
    technologies: ['TypeScript', 'Canvas API', 'WebAudio API', 'GSAP', 'CSS Architecture'],
    spell: {
      heading: 'Static Portfolio Monotony',
      body: 'Typical software portfolios are flat, sterile résumés that fail to demonstrate real-time architecture, state orchestration, and craft.'
    },
    incantation: {
      heading: 'The Broadsheet & Railway Orchestration Engine',
      body: 'Constructed a zero-bundler, modular ES-system pairing vintage linotype newspaper aesthetic with a cinematic railway timeline.',
      steps: [
        '1. Synchronize State Store via Tiny Pub/Sub',
        '2. Mount SVG Railway Parallax & Train Sprite',
        '3. Orchestrate Timelines via GSAP Context',
        '4. Bind Synthesized WebAudio SFX'
      ]
    },
    result: {
      summary: '100% responsive, zero-build interactive experience with full reduced-motion accessibility.',
      metrics: [
        { label: 'Build Step', value: '0' },
        { label: 'Lighthouse A11y', value: '100' },
        { label: 'Interactive Spells', value: '14' },
        { label: 'Pure WebAudio SFX', value: '8' }
      ]
    },
    artifacts: [
      {
        src: 'assets/images/projects/marauders-archive.svg',
        alt: 'The Marauder Engine Architecture',
        caption: 'State, motion, audio, and component orchestration diagram'
      }
    ],
    reveal: 'Every spell, sound, and railway movement is generated purely in client-side code without external asset dependencies.',
    github: 'https://github.com/rishi-bhardvaj',
    demo: '#work',
    theme: {
      sky: '#1a1208',
      accent: '#eab308',
      lantern: '#facc15'
    }
  },
  {
    id: 'room-of-requirement',
    order: 99,
    station: 'ROOM OF REQUIREMENT',
    category: 'Secret Vault',
    categoryKey: 'experimental',
    title: 'Secret Experimental Sandbox & AST Transformer',
    summary: 'Classified laboratory chamber unlocked only through curious inspection. Houses experimental AST transformations and reactive runtime experiments.',
    description: 'A hidden station uncovered along the wizarding railway line. Contains experimental prototypes in reactive state derivation, custom AST transformations, and generative vector cartography.',
    status: 'demo',
    isDemo: true,
    featured: false,
    get hidden() {
      return !isSecretStationUnlocked();
    },
    technologies: ['TypeScript', 'AST Parsing', 'Babel Core', 'Web Workers', 'Vector Graphics'],
    spell: {
      heading: 'The Hidden Chamber of Code',
      body: 'Experimental architectures that only reveal themselves to engineers who probe deeper into the parchment fabric.'
    },
    incantation: {
      heading: 'Seven Seals of Transmutation',
      body: 'Unlocked via seven rhythmic strikes upon the crest emblem, breaking the tamper seal of the classified ledger.',
      steps: [
        '1. Intercept Crest Click Sequence',
        '2. Verify 7-Beat Cadence',
        '3. Unmask Hidden Station in Route Matrix',
        '4. Trigger Seal-Fracture SFX & Anim'
      ]
    },
    result: {
      summary: 'Successfully unlocked the secret 7th station of the Wizarding Railway.',
      metrics: [
        { label: 'Seals Broken', value: '7' },
        { label: 'Secret Level', value: 'Classified' },
        { label: 'State Discovery', value: '100%' },
        { label: 'Easter Egg', value: 'Active' }
      ]
    },
    artifacts: [
      {
        src: 'assets/images/projects/room-of-requirement.svg',
        alt: 'Room of Requirement Chamber',
        caption: 'Classified experimental chamber'
      }
    ],
    reveal: 'You unlocked the secret station! Congratulations on your inquisitive spirit.',
    github: 'https://github.com/rishi-bhardvaj',
    demo: null,
    theme: {
      sky: '#170c1e',
      accent: '#ec4899',
      lantern: '#f472b6'
    }
  },
  {
    id: 'storefront-forge',
    order: 2,
    station: 'STOREFRONT FORGE',
    category: 'Freelance E-Commerce',
    categoryKey: 'freelance',
    title: 'Storefront Forge: Boutique E-Commerce Platform',
    summary: 'A custom storefront and admin for an independent boutique: catalogue with variants, Stripe checkout, order tracking and inventory sync, replacing marketplace fees with a brand the client owns.',
    description: 'DEMO CASE FILE. Replace with your real client work. Freelance engagement: designed and built a headless e-commerce platform for a growing boutique that was losing margin to marketplace fees and had no control over branding, stock or customer data.',
    status: 'shipped',
    isDemo: true,
    featured: false,
    hidden: false,
    technologies: ['Angular', 'NestJS', 'TypeScript', 'PostgreSQL', 'Stripe', 'Docker', 'JWT'],
    spell: {
      heading: 'The Marketplace Fee Trap',
      body: 'Marketplace commissions were eating the margin, product pages looked like everyone else\u2019s, and stock levels drifted out of sync across channels.'
    },
    incantation: {
      heading: 'Headless Commerce Pipeline',
      body: 'An Angular storefront with server-side rendering for search visibility, talking to a NestJS API that owns catalogue, cart, orders and inventory.',
      steps: [
        'Server-rendered Angular storefront with variant-aware product pages',
        'NestJS REST API: catalogue, cart, orders, admin',
        'Stripe Checkout with signed-webhook order reconciliation',
        'Nightly inventory sync and low-stock email alerts'
      ]
    },
    result: {
      summary: 'Placeholder impact figures. Swap in the client\u2019s real numbers.',
      metrics: [
        { label: 'Largest Contentful Paint', value: '1.4s' },
        { label: 'Checkout Conversion', value: '+22%' },
        { label: 'Marketplace Fees', value: '0' },
        { label: 'Admin Time Saved', value: '60%' }
      ]
    },
    artifacts: [
      { src: 'assets/images/projects/storefront-forge.svg', alt: 'Storefront Forge product page and admin dashboard', caption: 'Storefront with variant picker and the order admin' }
    ],
    reveal: 'The biggest win was boring: idempotent webhook handling meant a double-fired Stripe event could never create a double order.',
    github: null,
    demo: null,
    theme: { sky: '#1c1008', accent: '#e8a33a', lantern: '#ffb703' }
  },
  {
    id: 'clinic-compass',
    order: 4,
    station: 'CLINIC COMPASS',
    category: 'Freelance Healthcare',
    categoryKey: 'freelance',
    title: 'Clinic Compass: Appointment & Patient Portal',
    summary: 'Online booking and a role-based portal for a multi-doctor clinic: patients self-book, doctors see their day, admins manage slots, and every record view is audit-logged.',
    description: 'DEMO CASE FILE. Replace with your real client work. Freelance engagement: replaced phone-tag scheduling with a secure booking system, including reminders and a full audit trail for patient data access.',
    status: 'shipped',
    isDemo: true,
    featured: false,
    hidden: false,
    technologies: ['Java 17', 'Spring Boot 3', 'Angular', 'PostgreSQL', 'OAuth2', 'RBAC', 'Docker'],
    spell: {
      heading: 'Phone-Tag Scheduling',
      body: 'Receptionists juggled calls and a paper diary: double-bookings, forgotten follow-ups and no record of who had opened a patient file.'
    },
    incantation: {
      heading: 'Slot Engine with a Paper Trail',
      body: 'A conflict-free slot engine behind role-scoped APIs, with reminders queued off the request path and every sensitive read written to an audit log.',
      steps: [
        'OAuth2 login with patient, doctor and admin roles',
        'Slot engine with optimistic locking to prevent double-booking',
        'Queued SMS and email reminders',
        'Append-only audit log for every record view'
      ]
    },
    result: {
      summary: 'Placeholder impact figures. Swap in the client\u2019s real numbers.',
      metrics: [
        { label: 'No-Shows', value: '-38%' },
        { label: 'Booking Time', value: '45s' },
        { label: 'Access Roles', value: '3' },
        { label: 'Audit Coverage', value: '100%' }
      ]
    },
    artifacts: [
      { src: 'assets/images/projects/clinic-compass.svg', alt: 'Clinic Compass booking calendar and doctor schedule', caption: 'Slot picker for patients and the doctor day view' }
    ],
    reveal: 'Optimistic locking on the slot row, not a distributed lock, was enough: two people clicking the same 10:30 slot simply get a friendly "just taken" message.',
    github: null,
    demo: null,
    theme: { sky: '#081a1c', accent: '#4fd1c5', lantern: '#9be7de' }
  },
  {
    id: 'ledgerly',
    order: 6,
    station: 'LEDGERLY',
    category: 'Freelance SaaS',
    categoryKey: 'freelance',
    title: 'Ledgerly: Invoicing & Expense Dashboard',
    summary: 'A lean invoicing and cash-flow tool for small businesses: recurring invoices, payment reminders, expense capture and one-click PDF and CSV reports.',
    description: 'DEMO CASE FILE. Replace with your real client work. Freelance engagement: built a multi-tenant invoicing SaaS so a small agency could stop chasing payments in spreadsheets.',
    status: 'in-progress',
    isDemo: true,
    featured: false,
    hidden: false,
    technologies: ['NestJS', 'TypeScript', 'PostgreSQL', 'Redis', 'Jenkins', 'Docker', 'REST API'],
    spell: {
      heading: 'The Spreadsheet Ledger',
      body: 'Invoices lived in spreadsheets, reminders were manual, and nobody could answer "who owes us what?" without an afternoon of work.'
    },
    incantation: {
      heading: 'Tenant-Safe Billing Core',
      body: 'A multi-tenant NestJS core with row-level tenant scoping, cached dashboards and background jobs for recurring invoices and reminders.',
      steps: [
        'Tenant-scoped data model with row-level checks',
        'Recurring invoice scheduler on a Redis-backed queue',
        'Automated payment reminders with escalation rules',
        'PDF and CSV report generation on demand'
      ]
    },
    result: {
      summary: 'Placeholder impact figures. Swap in the client\u2019s real numbers.',
      metrics: [
        { label: 'Invoice Generation', value: '0.4s' },
        { label: 'Overdue Invoices', value: '-31%' },
        { label: 'Report Formats', value: '2' },
        { label: 'Uptime', value: '99.9%' }
      ]
    },
    artifacts: [
      { src: 'assets/images/projects/ledgerly.svg', alt: 'Ledgerly cash-flow dashboard and invoice list', caption: 'Cash-flow dashboard with overdue invoices flagged' }
    ],
    reveal: 'Caching the dashboard aggregates per tenant, invalidated by invoice events, took the home screen from seconds to instant on large accounts.',
    github: null,
    demo: null,
    theme: { sky: '#0f1620', accent: '#7aa2f7', lantern: '#b4ccff' }
  }
];

export function isSecretStationUnlocked() {
  if (typeof window === 'undefined' || !window.sessionStorage) return false;
  return sessionStorage.getItem('chronicle_unlocked_secret') === 'true';
}

export function unlockSecretStation() {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    sessionStorage.setItem('chronicle_unlocked_secret', 'true');
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('chronicle:secret-unlocked'));
  }
}

// Run dev-time validation
rawProjects.forEach(validateProject);

export const projects = Object.freeze([...rawProjects].sort((a, b) => a.order - b.order).map((p, idx) => {
  const base = {
    ...p,
    number: String(idx + 1).padStart(2, '0'),
    technologies: Object.freeze([...p.technologies]),
    spell: Object.freeze({ ...p.spell }),
    incantation: Object.freeze({
      ...p.incantation,
      steps: Object.freeze([...p.incantation.steps])
    }),
    result: Object.freeze({
      ...p.result,
      metrics: Object.freeze(p.result.metrics.map(m => Object.freeze({ ...m })))
    }),
    artifacts: Object.freeze(p.artifacts.map(a => Object.freeze({ ...a }))),
    theme: Object.freeze({ ...p.theme })
  };
  if (p.id === 'room-of-requirement') {
    Object.defineProperty(base, 'hidden', {
      get() { return !isSecretStationUnlocked(); },
      enumerable: true,
      configurable: false
    });
  }
  return Object.freeze(base);
}));

export function getProjectById(id) {
  return projects.find(p => p.id === id) || null;
}

