/**
 * Career Ledger Data
 * Movement records since 2021 with expandable details.
 */

const rawExperience = [
  {
    id: 'edgeverve',
    period: 'Aug 2025 — Now',
    role: 'Software Engineer',
    company: 'EDGEVERVE SYSTEMS (INFOSYS)',
    location: 'Bangalore, India',
    description: 'Observed daily, building enterprise banking platform engines — limits, collaterals, covenants, and maker-checker approval workflows. Resolving 79 mission-critical production defects and delivering 40+ client-ready features across core banking services.',
    badges: ['Java 17', 'Spring Boot 3', 'Oracle PL/SQL', 'Finacle FNPR'],
    details: [
      'Core contributor to Finacle Credit Limits, Collaterals, and Covenant compliance engines.',
      'Engineered configurable maker-checker dual-authorization approval pipelines preventing unauthorized mutations.',
      'Identified, debugged, and resolved 79 production defects in live Tier-1 banking systems.',
      'Architected high-throughput relational SQL routines and Oracle PL/SQL triggers for transaction ledgers.'
    ]
  },
  {
    id: 'eventgo',
    period: '2024 — 2025',
    role: 'Backend Architect',
    company: 'EVENTGO PLATFORM',
    location: 'Remote',
    description: 'Designed high-throughput NestJS marketplace architecture with Prisma ORM and PostgreSQL. Shipped 25 REST APIs, automated Swagger documentation, role-based JWT authentication, and webhook payment integrations.',
    badges: ['NestJS', 'TypeScript', 'Prisma ORM', 'PostgreSQL'],
    details: [
      'Architected 6+ relational schemas with automated Prisma ORM migrations.',
      'Built 25 RESTful endpoints with OpenAPI/Swagger specifications and comprehensive validation.',
      'Secured routes with JWT token rotation and role-based access control (RBAC).',
      'Configured automated transactional webhook listeners for Stripe payment reconciliation.'
    ]
  },
  {
    id: 'ijrpr',
    period: '2024 — 2025',
    role: 'Published Researcher',
    company: 'IJRPR JOURNAL (RESEARCH)',
    location: 'Peer-Reviewed Publication',
    description: 'Authored peer-reviewed research paper titled "Gait Analysis of Human Behaviour" in the International Journal of Research Publication and Reviews (IJRPR), developing non-intrusive vision and accelerometer gait tracking models.',
    badges: ['Python', 'Computer Vision', 'OpenCV'],
    details: [
      'Formulated vision extraction algorithms using OpenCV to map body joint trajectories.',
      'Published findings in International Journal of Research Publication and Reviews (IJRPR), 2025.',
      'Eliminated reliance on intrusive physical accelerometer sensors with video modeling.',
      'Demonstrated robust kinematic pattern classification across varying illumination conditions.'
    ]
  },
  {
    id: 'dsatm',
    period: '2021 — 2025',
    role: 'B.E. Computer Science',
    company: 'DAYANANDA SAGAR ACADEMY (DSATM)',
    location: 'Bangalore, India',
    description: 'First recorded appearance. Led intern teams of 8 developers, earned Runner-Up in Enterprise Products Hackathon, 2nd Runner-Up in Hackzion National Level Hackathon, and contributed to open source repositories.',
    badges: ['Algorithms', 'Distributed Systems', 'Hackathons'],
    details: [
      'Graduated with Distinction in Computer Science & Engineering.',
      'Led and mentored an engineering team of 8 developers during intensive hackathons.',
      'Secured Runner-Up at Enterprise Products Hackathon & 2nd Runner-Up at Hackzion.',
      'Contributed actively to open source software repositories across Hacktoberfest 2023–2025.'
    ]
  }
];

export const experience = Object.freeze(rawExperience.map(item => Object.freeze({
  ...item,
  badges: Object.freeze([...item.badges]),
  details: Object.freeze([...item.details])
})));
