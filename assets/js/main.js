// ==========================================================================
// THE DAILY BROADSHEET — MAIN APPLICATION BUNDLE & ORCHESTRATOR
// Universal Vanilla JS Bundle (Runs locally on file:/// and on web servers)
// ==========================================================================

(function() {
  'use strict';

  // 1. DATA STORES
  const caseDossiers = {
    finacle: {
      id: 'finacle',
      category: 'banking',
      categoryLabel: 'SPECIAL REPORT • EDGEVERVE',
      badge: 'BANKING CORE',
      exhibit: 'EXHIBIT A // CLASSIFIED',
      title: 'Finacle FNPR Enterprise Banking Core',
      headline: 'FINACLE BANKING CORE CLEARS ENTERPRISE AUDIT',
      domain: 'TARGET: EDGEVERVE SYSTEMS (INFOSYS)',
      timeline: 'TIMELINE: AUG 2025 — PRESENT',
      year: '2025 — Present',
      dropCap: 'F',
      summary: 'Tier-1 banking platform powering global financial institutions. Engineered modules for Limits, Collaterals, and Covenants with maker-checker security workflows. Resolved 79 production defects.',
      description: 'Investigation confirmed active deployment on Finacle FNPR — one of the world’s leading Tier-1 core banking engines. The subject engineered mission-critical financial modules governing Credit Limits, Collaterals, and Covenant compliance. Implemented strict maker-checker multi-tiered approval pipelines to prevent unauthorized financial mutations. Successfully identified and eradicated 79 production defects while shipping 40+ client-ready enterprise enhancements.',
      techStack: ['Java 17', 'Spring Boot 3', 'PostgreSQL', 'Oracle DB', 'PL/SQL', 'Angular', 'OAuth2', 'RBAC'],
      metrics: [
        'Resolved 79 mission-critical enterprise production defects across live banking environments',
        'Engineered and delivered 40+ client-ready business features for financial institutions',
        'Designed configurable maker-checker dual-authorization workflows for covenant violations',
        'Optimized heavy relational SQL queries across high-volume transaction ledgers'
      ]
    },
    eventgo: {
      id: 'eventgo',
      category: 'cloud',
      categoryLabel: 'MARKETPLACE ENGINE • EVENTGO.IO',
      badge: 'DISTRIBUTED BACKEND',
      exhibit: 'EXHIBIT B // CLASSIFIED',
      title: 'EventGo — Event Marketplace & Ticketing Engine',
      headline: 'WHERE DO WE GET OUR TICKETS NOW?',
      domain: 'TARGET: BACKEND ARCHITECTURE // EVENTGO.IO',
      timeline: 'TIMELINE: 2025',
      year: '2025',
      dropCap: 'B',
      summary: 'High-concurrency event marketplace backend designed in NestJS & TypeScript. Engineered 25 REST APIs, 6+ relational schemas with automated Prisma ORM migrations, and webhook payment gateways.',
      description: 'Forensic inspection of the EventGo platform revealed a modular NestJS and TypeScript backend architecture designed for high-concurrency event bookings and artist discovery. Structured 6+ core relational database entities with automated Prisma ORM migrations. Integrated full Swagger/OpenAPI documentation and robust webhook handlers for transactional payments.',
      techStack: ['NestJS', 'TypeScript', 'Prisma ORM', 'PostgreSQL', 'JWT Authentication', 'Swagger / OpenAPI', 'Stripe Webhooks'],
      metrics: [
        'Engineered 25 production-ready RESTful API endpoints with full input validation',
        'Architected 6+ interconnected relational data models (Users, Events, Artists, Bookings, Reviews, Payments)',
        'Implemented JWT authentication with role-based access for organizers, artists, and attendees',
        'Configured automated schema migrations with zero-downtime deployment pipelines'
      ]
    },
    cicd: {
      id: 'cicd',
      category: 'devops',
      categoryLabel: 'EXCLUSIVE METRICS • INFRASTRUCTURE',
      badge: 'CI/CD ACCELERATION',
      exhibit: 'EXHIBIT C // CLASSIFIED',
      title: 'Enterprise CI/CD Pipeline Accelerator',
      headline: 'PIPELINE EXECUTION TIMES CRASH BY 75%',
      domain: 'TARGET: INFRASTRUCTURE & AUTOMATION MATRIX',
      timeline: 'TIMELINE: 2024 — 2025',
      year: '2024 — 2025',
      dropCap: 'I',
      summary: 'Parallelized test runner sharding and Docker artifact caching slashed pipeline runtimes from 120 minutes to 30 minutes across distributed build nodes.',
      description: 'Audited enterprise build and testing infrastructure suffering from severe bottleneck latency. Re-architected Jenkins and GitLab automation pipelines by introducing multi-stage Docker layer caching, parallelized unit/integration test sharding, and optimized artifact repository caching.',
      techStack: ['Jenkins', 'Docker', 'GitLab CI', 'JUnit 5', 'Bash Scripting', 'Maven / Gradle Cache'],
      metrics: [
        'Slashed enterprise test and build execution times from 120 minutes down to 30 minutes (75% time reduction)',
        'Introduced parallel test runner sharding across distributed build agents',
        'Automated pull request gating with automated linting, security scans, and code coverage checks',
        'Cut server compute consumption and developer feedback turnaround by 4x'
      ],
      isChart: true
    },
    research: {
      id: 'research',
      category: 'research',
      categoryLabel: 'PEER-REVIEWED PUBLICATION • IJRPR',
      badge: 'COMPUTER VISION',
      exhibit: 'EXHIBIT D // CLASSIFIED',
      title: 'Gait Analysis of Human Behaviour (IJRPR)',
      headline: 'MACHINE RECOGNITION OF HUMAN BEHAVIOUR',
      domain: 'TARGET: INTERNATIONAL JOURNAL OF RESEARCH PUBLICATION',
      timeline: 'TIMELINE: 2025',
      year: '2025',
      dropCap: 'G',
      summary: 'Authored peer-reviewed paper in IJRPR exploring computer-vision and accelerometer sensor gait tracking models to classify human behavioral movements non-intrusively.',
      description: 'The subject authored and published a peer-reviewed research investigation in the International Journal of Research Publication and Reviews (IJRPR). The research explores computer-vision and sensor-driven gait tracking algorithms to identify distinctive human behavioral patterns without intrusive tracking sensors.',
      techStack: ['Python', 'OpenCV', 'Computer Vision', 'Biometric Signal Processing', 'Statistical Data Models'],
      metrics: [
        'Published in peer-reviewed International Journal of Research Publication and Reviews (IJRPR), 2025',
        'Formulated non-intrusive vision extraction algorithms for gait trajectory mapping',
        'Demonstrated pattern recognition reliability across varied environmental illumination conditions',
        'Applied biometric kinematic modeling to behavioral classification datasets'
      ]
    },
    rbac: {
      id: 'rbac',
      category: 'banking',
      categoryLabel: 'IDENTITY VAULT • SECURITY CORE',
      badge: 'ZERO-TRUST RBAC',
      exhibit: 'EXHIBIT E // CLASSIFIED',
      title: 'Zero-Trust RBAC & Identity Guard',
      headline: 'ZERO-TRUST IDENTITY VAULT GUARDS FINANCIAL ASSETS',
      domain: 'TARGET: ENTERPRISE SECURITY VAULT',
      timeline: 'TIMELINE: 2024 — 2025',
      year: '2024 — 2025',
      dropCap: 'M',
      summary: 'Multi-tenant identity vault incorporating OAuth2, JWT rotation, and strict RBAC policies guarding financial transaction endpoints against unauthorized escalation.',
      description: 'Designed and deployed an enterprise-grade authorization and authentication engine utilizing OAuth2, OpenID Connect (SSO), and fine-grained Role-Based Access Control (RBAC). Built with strict tamper-evident audit logging suitable for regulated banking regulations and compliance mandates.',
      techStack: ['Spring Security', 'OAuth2 / OIDC', 'JSON Web Tokens (JWT)', 'SSO', 'RBAC Policies', 'Audit Trail Logging'],
      metrics: [
        'Engineered granular permission hierarchies protecting high-stakes financial operations',
        'Implemented cryptographically signed JWT token rotation with instantaneous revocation lists',
        'Integrated enterprise Single Sign-On (SSO) across distributed microservices',
        'Eliminated permission privilege escalation attack vectors via strict decorator guards'
      ]
    },
    hackathons: {
      id: 'hackathons',
      category: 'cloud',
      categoryLabel: 'RAPID ARCHITECTURE • COMPETITIONS',
      badge: 'TEAM LEADERSHIP',
      exhibit: 'EXHIBIT F // CLASSIFIED',
      title: 'Rapid Prototype Engines & Team Leadership',
      headline: 'INTERN SQUAD DELIVERS HIGH-VELOCITY APPS',
      domain: 'TARGET: NATIONAL LEVEL COMPETITIONS & OPEN SOURCE',
      timeline: 'TIMELINE: 2023 — 2025',
      year: '2023 — 2025',
      dropCap: 'R',
      summary: 'Directly led and mentored intern squads of 8 developers, conceptualizing full-stack architectures and winning national hackathons with open-source contributions.',
      description: 'Demonstrated rapid architectural execution and engineering leadership under strict hackathon time constraints. Directed an engineering squad of 8 developers, conceptualizing, building, and presenting full-stack distributed applications.',
      techStack: ['TypeScript', 'Node.js', 'React', 'Team Leadership', 'Open Source', 'GitLab / GitHub'],
      metrics: [
        'Runner-Up: Enterprise Products Hackathon',
        '2nd Runner-Up: Hackzion National Level Hackathon',
        'Directly led, mentored, and coordinated an intern engineering team of 8 developers',
        'Active contributor to open source software repositories across Hacktoberfest 2023 — 2025'
      ]
    }
  };

  const skillsData = [
    {
      id: 'java-spring',
      name: 'Java 17 & Spring Boot 3',
      code: 'SPRG',
      category: 'backend',
      categoryLabel: 'Backend Core',
      detected: 'Most days',
      finding: 'PRIMARY TOOL',
      levelType: 'primary',
      description: 'Enterprise backend microservices, Finacle core, transactional banking workflows, multithreading & Spring Data JPA.'
    },
    {
      id: 'ts-nest',
      name: 'TypeScript & NestJS',
      code: 'NEST',
      category: 'backend',
      categoryLabel: 'Backend Core',
      detected: 'Most days',
      finding: 'PRIMARY TOOL',
      levelType: 'primary',
      description: 'High-throughput modular API engines, dependency injection, Prisma ORM, and scalable microservices.'
    },
    {
      id: 'postgres',
      name: 'PostgreSQL',
      code: 'PG',
      category: 'database',
      categoryLabel: 'Databases',
      detected: 'In projects',
      finding: 'PRIMARY TOOL',
      levelType: 'primary',
      description: 'Relational data modeling, ACID transactions, complex query tuning, indexing, and connection pooling.'
    },
    {
      id: 'oracle',
      name: 'Oracle DB & PL/SQL',
      code: 'ORA',
      category: 'database',
      categoryLabel: 'Databases',
      detected: 'Enterprise core',
      finding: 'PRIMARY TOOL',
      levelType: 'primary',
      description: 'Finacle enterprise core storage, stored procedures, triggers, high-volume transactional schemas.'
    },
    {
      id: 'auth-rbac',
      name: 'OAuth2, JWT & SSO (RBAC)',
      code: 'AUTH',
      category: 'security',
      categoryLabel: 'Security & Auth',
      detected: 'Financial systems',
      finding: 'PRIMARY TOOL',
      levelType: 'primary',
      description: 'Zero-trust authorization matrices, token rotation, cryptographic validation, and maker-checker audit guardrails.'
    },
    {
      id: 'docker-k8s',
      name: 'Docker & Containerization',
      code: 'DCKR',
      category: 'devops',
      categoryLabel: 'Cloud & DevOps',
      detected: 'When needed',
      finding: 'COMFORTABLE',
      levelType: 'comfortable',
      description: 'Multi-stage Docker builds, image layer caching, local orchestration, containerized microservice clusters.'
    },
    {
      id: 'jenkins-cicd',
      name: 'Jenkins CI/CD Automation',
      code: 'JNKS',
      category: 'devops',
      categoryLabel: 'Cloud & DevOps',
      detected: 'Pipeline optimization',
      finding: 'COMFORTABLE',
      levelType: 'comfortable',
      description: 'Automated test runner sharding, Docker layer caching, linting gates, 75% pipeline speed acceleration.'
    },
    {
      id: 'prisma-mongo',
      name: 'Prisma ORM & MongoDB',
      code: 'PRIS',
      category: 'database',
      categoryLabel: 'Databases',
      detected: 'In projects',
      finding: 'COMFORTABLE',
      levelType: 'comfortable',
      description: 'Automated migrations, type-safe query generation, NoSQL document storage, flexible data access.'
    },
    {
      id: 'angular-react',
      name: 'Angular & React',
      code: 'UI',
      category: 'ui',
      categoryLabel: 'Frontend UI',
      detected: 'Full-stack UI',
      finding: 'COMFORTABLE',
      levelType: 'comfortable',
      description: 'Component architecture, responsive state management, client dashboards, and Tailwind CSS design systems.'
    },
    {
      id: 'python-ml',
      name: 'Python & ML Models',
      code: 'PY',
      category: 'research',
      categoryLabel: 'AI & Research',
      detected: 'Research & scripts',
      finding: 'COMFORTABLE',
      levelType: 'comfortable',
      description: 'Computer vision, OpenCV, gait kinematic analysis, automated data ingestion and scripting.'
    },
    {
      id: 'cloud-oci',
      name: 'AWS & Oracle Cloud (OCI)',
      code: 'CLD',
      category: 'devops',
      categoryLabel: 'Cloud & DevOps',
      detected: 'Amplify • S3 • OCI',
      finding: 'IN TRAINING',
      levelType: 'training',
      description: 'Object storage, serverless lambdas, cloud compute instances, and infrastructure provisioning.'
    }
  ];

  // 2. THEME ENGINE
  const THEME_KEY = 'prophet_theme_edition';
  function initTheme() {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const mobileThemeToggleBtn = document.getElementById('mobileThemeToggleBtn');
    
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'nox' || (!savedTheme && prefersDark)) {
      applyTheme('nox');
    } else {
      applyTheme('lumos');
    }

    function toggleTheme() {
      const isCurrentlyNox = document.documentElement.classList.contains('theme-nox');
      const newTheme = isCurrentlyNox ? 'lumos' : 'nox';
      applyTheme(newTheme);
      localStorage.setItem(THEME_KEY, newTheme);
    }

    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
    if (mobileThemeToggleBtn) mobileThemeToggleBtn.addEventListener('click', toggleTheme);
  }

  function applyTheme(theme) {
    const isNox = theme === 'nox';
    if (isNox) {
      document.documentElement.classList.add('theme-nox');
    } else {
      document.documentElement.classList.remove('theme-nox');
    }

    [document.getElementById('themeToggleBtn'), document.getElementById('mobileThemeToggleBtn')].forEach(btn => {
      if (!btn) return;
      btn.setAttribute('aria-label', isNox ? 'Switch to Broadsheet Day Edition' : 'Switch to Nocturnal Edition');
      btn.title = isNox ? 'Lumos (Day Edition)' : 'Nox (Night Edition)';
      btn.innerHTML = isNox
        ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`
        : `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>`;
    });
  }

  // 3. AUDIO & HEDWIG'S THEME SYNTHESIZER
  const SOUND_KEY = 'prophet_sound_enabled';
  let audioCtx = null;
  let isSoundEnabled = false;
  let isMusicPlaying = false;
  let musicTimeout = null;
  let currentNoteIndex = 0;

  const hedwigMelody = [
    { freq: 493.88, dur: 450 },
    { freq: 659.25, dur: 650 },
    { freq: 783.99, dur: 320 },
    { freq: 739.99, dur: 320 },
    { freq: 659.25, dur: 650 },
    { freq: 987.77, dur: 450 },
    { freq: 880.00, dur: 900 },
    { freq: 739.99, dur: 900 },
    { freq: 659.25, dur: 650 },
    { freq: 783.99, dur: 320 },
    { freq: 739.99, dur: 320 },
    { freq: 622.25, dur: 650 },
    { freq: 698.46, dur: 450 },
    { freq: 493.88, dur: 1100 },
    { freq: 0,      dur: 250 },
    { freq: 493.88, dur: 450 },
    { freq: 659.25, dur: 650 },
    { freq: 783.99, dur: 320 },
    { freq: 739.99, dur: 320 },
    { freq: 659.25, dur: 650 },
    { freq: 987.77, dur: 450 },
    { freq: 1174.66, dur: 650 },
    { freq: 1108.73, dur: 450 },
    { freq: 1046.50, dur: 900 },
    { freq: 830.61, dur: 450 },
    { freq: 1046.50, dur: 550 },
    { freq: 987.77, dur: 320 },
    { freq: 932.33, dur: 320 },
    { freq: 466.16, dur: 550 },
    { freq: 783.99, dur: 450 },
    { freq: 659.25, dur: 1400 },
    { freq: 0,      dur: 800 }
  ];

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function initAudio() {
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    const mobileSoundToggleBtn = document.getElementById('mobileSoundToggleBtn');
    const musicToggleBtn = document.getElementById('musicToggleBtn');
    const mobileMusicToggleBtn = document.getElementById('mobileMusicToggleBtn');

    isSoundEnabled = localStorage.getItem(SOUND_KEY) === 'true';
    updateSoundButtons();
    updateMusicButtons();

    function toggleSound() {
      isSoundEnabled = !isSoundEnabled;
      localStorage.setItem(SOUND_KEY, isSoundEnabled);
      updateSoundButtons();
      if (isSoundEnabled) playWandChime();
    }

    function toggleMusic() {
      if (isMusicPlaying) {
        stopHedwigTheme();
      } else {
        startHedwigTheme();
      }
    }

    if (soundToggleBtn) soundToggleBtn.addEventListener('click', toggleSound);
    if (mobileSoundToggleBtn) mobileSoundToggleBtn.addEventListener('click', toggleSound);
    if (musicToggleBtn) musicToggleBtn.addEventListener('click', toggleMusic);
    if (mobileMusicToggleBtn) mobileMusicToggleBtn.addEventListener('click', toggleMusic);

    document.addEventListener('click', (e) => {
      if (!isSoundEnabled) return;
      const target = e.target.closest('button, .nav-link, .stamp-distressed, .btn-ink, .btn-stamp-link, .filter-tab-btn');
      if (target && !target.id?.includes('music')) {
        if (target.classList.contains('stamp-distressed') || target.classList.contains('btn-ink')) {
          playStampThud();
        } else {
          playPaperRustle();
        }
      }
    });
  }

  function updateSoundButtons() {
    [document.getElementById('soundToggleBtn'), document.getElementById('mobileSoundToggleBtn')].forEach(btn => {
      if (!btn) return;
      btn.setAttribute('aria-label', isSoundEnabled ? 'Mute Sound FX' : 'Enable Sound FX');
      btn.title = isSoundEnabled ? 'Sound FX: Enabled' : 'Sound FX: Muted';
      btn.innerHTML = isSoundEnabled
        ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>`
        : `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/><path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>`;
    });
  }

  function updateMusicButtons() {
    [document.getElementById('musicToggleBtn'), document.getElementById('mobileMusicToggleBtn')].forEach(btn => {
      if (!btn) return;
      btn.setAttribute('aria-label', isMusicPlaying ? "Pause Hedwig's Theme" : "Play Harry Potter Theme (Hedwig's Theme)");
      btn.title = isMusicPlaying ? "Hedwig's Theme: Playing 🎵" : "Play Harry Potter Theme Song 🎵";
      if (isMusicPlaying) {
        btn.classList.add('active');
        btn.innerHTML = `<svg class="w-4 h-4 animate-pulse text-[#9e1d1d]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`;
      } else {
        btn.classList.remove('active');
        btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>`;
      }
    });
  }

  function playCelestaNote(freq, durationMs) {
    if (freq === 0) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const durationSec = durationMs / 1000;

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.005, now);

    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0.14, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.2, durationSec * 1.35));

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.04, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.15, durationSec * 0.9));

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(ctx.destination);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + durationSec * 1.4);
    osc2.stop(now + durationSec * 1.4);
  }

  function startHedwigTheme() {
    isMusicPlaying = true;
    updateMusicButtons();
    currentNoteIndex = 0;

    function step() {
      if (!isMusicPlaying) return;
      const note = hedwigMelody[currentNoteIndex];
      playCelestaNote(note.freq, note.dur);
      currentNoteIndex = (currentNoteIndex + 1) % hedwigMelody.length;
      musicTimeout = setTimeout(step, note.dur);
    }
    step();
  }

  function stopHedwigTheme() {
    isMusicPlaying = false;
    if (musicTimeout) {
      clearTimeout(musicTimeout);
      musicTimeout = null;
    }
    updateMusicButtons();
  }

  function playPaperRustle() {
    if (!isSoundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 1.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  }

  function playStampThud() {
    if (!isSoundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }

  function playWandChime() {
    const ctx = getAudioContext();
    if (!ctx) return;

    [587.33, 880, 1174.66].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.05);
      osc.stop(ctx.currentTime + idx * 0.05 + 0.25);
    });
  }

  // 4. NAVIGATION & MOBILE DRAWER
  function initNavigation() {
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const mobileDrawer = document.getElementById('mobileNavDrawer');
    const mobileBackdrop = document.getElementById('mobileNavBackdrop');
    const mobileClose = document.getElementById('mobileNavClose');
    const progressBar = document.getElementById('scrollProgressBar');

    function openDrawer() {
      if (mobileDrawer) mobileDrawer.classList.add('active');
      if (mobileBackdrop) mobileBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      if (mobileDrawer) mobileDrawer.classList.remove('active');
      if (mobileBackdrop) mobileBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (mobileToggle) mobileToggle.addEventListener('click', openDrawer);
    if (mobileClose) mobileClose.addEventListener('click', closeDrawer);
    if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeDrawer);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#' || !href) return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          closeDrawer();
          const headerOffset = 70;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });

    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

    window.addEventListener('scroll', () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0 && progressBar) {
        const progress = (window.scrollY / totalHeight) * 100;
        progressBar.style.width = `${progress}%`;
      }

      let currentId = '';
      const scrollPos = window.pageYOffset + 220;
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          currentId = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        }
      });
    }, { passive: true });
  }

  // 5. LIVE MASTHEAD & CONCURRENCY
  function initMasthead() {
    const dateElement = document.getElementById('liveIssueDate');
    if (dateElement) {
      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
      dateElement.textContent = `Bangalore • ${now.toLocaleDateString('en-GB', options)} Edition`;
    }

    const weatherTempEl = document.getElementById('weatherTemp');
    const states = [
      '24°C High Concurrency',
      '23°C Peak Traffic Flow',
      '25°C Zero-Latency Peak',
      '24°C High Concurrency'
    ];
    let stateIndex = 0;
    setInterval(() => {
      stateIndex = (stateIndex + 1) % states.length;
      if (weatherTempEl) weatherTempEl.textContent = states[stateIndex];
    }, 12000);
  }

  // 6. MOVING PORTRAIT & PARALLAX
  function initPortrait() {
    const photoFrame = document.querySelector('.prophet-photo-frame');
    const userImg = document.querySelector('.prophet-user-img');
    const filterBtns = document.querySelectorAll('.photo-filter-btn');

    if (!photoFrame || !userImg) return;

    photoFrame.addEventListener('mousemove', (e) => {
      const rect = photoFrame.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      userImg.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    });

    photoFrame.addEventListener('mouseleave', () => {
      userImg.style.transform = '';
    });

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filterType = btn.getAttribute('data-filter');
        switch (filterType) {
          case 'linotype':
            userImg.style.filter = 'contrast(1.25) grayscale(1) brightness(0.95)';
            break;
          case 'daguerreotype':
            userImg.style.filter = 'contrast(1.15) sepia(0.45) brightness(0.92)';
            break;
          case 'amber':
            userImg.style.filter = 'contrast(1.1) sepia(0.2) hue-rotate(15deg) brightness(1.02)';
            break;
          default:
            userImg.style.filter = 'contrast(1.08) brightness(0.96) sepia(0.18)';
        }
      });
    });
  }

  // 7. ARTICLES & WORK GRID
  function initArticles() {
    renderArticles('all');
    const filterBtns = document.querySelectorAll('.filter-tab-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const category = btn.getAttribute('data-category');
        renderArticles(category);
      });
    });
  }

  function renderArticles(category) {
    const container = document.getElementById('articlesGrid');
    if (!container) return;

    const dossierList = Object.values(caseDossiers);
    const filtered = category === 'all' ? dossierList : dossierList.filter(item => item.category === category);

    container.innerHTML = filtered.map(dossier => {
      if (dossier.isChart) {
        return `
          <article class="sub-article-card" data-category="${dossier.category}">
            <div>
              <div class="article-category-tag">${dossier.categoryLabel}</div>
              <h3 class="article-headline">${dossier.headline}</h3>
              <div class="prophet-chart-box">
                <div class="chart-header-row">
                  <span>JENKINS CI/CD EXECUTION</span>
                  <span class="text-[#9e1d1d] font-bold">-75% TIME</span>
                </div>
                <svg viewBox="0 0 200 70" class="chart-svg">
                  <line x1="10" y1="10" x2="190" y2="10" stroke="var(--border-divider)" stroke-width="0.75" stroke-dasharray="2,2"/>
                  <line x1="10" y1="35" x2="190" y2="35" stroke="var(--border-divider)" stroke-width="0.75" stroke-dasharray="2,2"/>
                  <line x1="10" y1="60" x2="190" y2="60" stroke="var(--border-ink)" stroke-width="1"/>
                  <polyline points="15,12 50,18 90,28 130,52 185,55" fill="none" stroke="var(--stamp-red)" stroke-width="2.5"/>
                  <circle cx="15" cy="12" r="3.5" fill="var(--stamp-red)" class="chart-point" data-tooltip="Legacy: 120 Minutes"/>
                  <circle cx="185" cy="55" r="3.5" fill="var(--stamp-red)" class="chart-point" data-tooltip="Optimized: 30 Minutes (-75%)"/>
                  <text x="15" y="24" font-family="Space Mono" font-size="7" fill="var(--text-ink)">120m</text>
                  <text x="155" y="50" font-family="Space Mono" font-size="7" fill="var(--stamp-red)" font-weight="bold">30m</text>
                </svg>
              </div>
              <div class="linotype-column mb-4">
                <span class="ornate-drop-box">${dossier.dropCap}</span>
                ${dossier.summary}
              </div>
            </div>
            <div>
              <div class="article-tags-wrap">
                ${dossier.techStack.slice(0, 4).map(tech => `<span class="stamp-badge">${tech}</span>`).join('')}
              </div>
              <div class="article-footer-row">
                <span class="text-[#766953]">${dossier.year}</span>
                <button class="btn-stamp-link" data-dossier-id="${dossier.id}">OPEN CASE FILE &rarr;</button>
              </div>
            </div>
          </article>
        `;
      }

      return `
        <article class="sub-article-card" data-category="${dossier.category}">
          <div>
            <div class="article-category-tag">${dossier.categoryLabel}</div>
            <h3 class="article-headline">${dossier.headline}</h3>
            <div class="linotype-column mb-4">
              <span class="ornate-drop-box">${dossier.dropCap}</span>
              ${dossier.summary}
            </div>
          </div>
          <div>
            <div class="article-tags-wrap">
              ${dossier.techStack.slice(0, 4).map(tech => `<span class="stamp-badge">${tech}</span>`).join('')}
            </div>
            <div class="article-footer-row">
              <span class="text-[#766953]">${dossier.year}</span>
              <button class="btn-stamp-link" data-dossier-id="${dossier.id}">OPEN CASE FILE &rarr;</button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    container.querySelectorAll('.btn-stamp-link').forEach(btn => {
      btn.addEventListener('click', () => {
        const caseId = btn.getAttribute('data-dossier-id');
        openCaseModal(caseId);
      });
    });

    initChartInteractions();
  }

  function initChartInteractions() {
    const chartPoints = document.querySelectorAll('.chart-point');
    let tooltip = document.querySelector('.chart-tooltip');
    if (!tooltip && chartPoints.length > 0) {
      tooltip = document.createElement('div');
      tooltip.className = 'chart-tooltip';
      document.body.appendChild(tooltip);
    }
    chartPoints.forEach(point => {
      point.addEventListener('mouseenter', () => {
        const text = point.getAttribute('data-tooltip');
        if (!text || !tooltip) return;
        tooltip.textContent = text;
        tooltip.style.opacity = '1';
        const rect = point.getBoundingClientRect();
        tooltip.style.left = `${rect.left + window.scrollX - 20}px`;
        tooltip.style.top = `${rect.top + window.scrollY - 30}px`;
      });
      point.addEventListener('mouseleave', () => {
        if (tooltip) tooltip.style.opacity = '0';
      });
    });
  }

  // 8. LAB REPORT & FORENSICS SEARCH
  let currentSkillCategory = 'all';
  let skillSearchQuery = '';

  function initLabReport() {
    renderLabReport();
    const searchInput = document.getElementById('skillSearchInput');
    const pillBtns = document.querySelectorAll('.lab-pill-btn');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        skillSearchQuery = e.target.value.toLowerCase().trim();
        renderLabReport();
      });
    }

    pillBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        pillBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSkillCategory = btn.getAttribute('data-category');
        renderLabReport();
      });
    });
  }

  function renderLabReport() {
    const tableBody = document.getElementById('forensicsTableBody');
    const mobileCardsContainer = document.getElementById('forensicsMobileCards');
    const countBadge = document.getElementById('skillCountBadge');

    const filtered = skillsData.filter(skill => {
      const matchesCat = currentSkillCategory === 'all' || skill.category === currentSkillCategory;
      const matchesSearch = !skillSearchQuery || 
        skill.name.toLowerCase().includes(skillSearchQuery) ||
        skill.code.toLowerCase().includes(skillSearchQuery) ||
        skill.description.toLowerCase().includes(skillSearchQuery);
      return matchesCat && matchesSearch;
    });

    if (countBadge) countBadge.textContent = `${filtered.length} Detected`;

    if (tableBody) {
      if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center py-6 font-mono text-xs text-[#766953]">NO SUBSTANCES DETECTED MATCHING QUERY</td></tr>`;
      } else {
        tableBody.innerHTML = filtered.map(skill => {
          const badgeClass = skill.levelType === 'primary' ? 'stamp-red-box' : 'stamp-black-box';
          return `
            <tr>
              <td class="font-serif text-base sm:text-lg text-[var(--text-ink)] font-bold">
                ${skill.name}
                <div class="font-sans text-xs text-[var(--text-muted)] font-normal mt-0.5">${skill.description}</div>
              </td>
              <td class="font-mono text-xs text-[var(--text-muted)]">${skill.code}</td>
              <td class="font-mono text-xs text-[var(--text-muted)]">${skill.detected}</td>
              <td class="text-right"><span class="${badgeClass}">${skill.finding}</span></td>
            </tr>
          `;
        }).join('');
      }
    }

    if (mobileCardsContainer) {
      if (filtered.length === 0) {
        mobileCardsContainer.innerHTML = `<div class="text-center py-6 font-mono text-xs text-[#766953] border border-dashed border-[#b09e75]">NO SUBSTANCES DETECTED MATCHING QUERY</div>`;
      } else {
        mobileCardsContainer.innerHTML = filtered.map(skill => {
          const badgeClass = skill.levelType === 'primary' ? 'stamp-red-box' : 'stamp-black-box';
          return `
            <div class="forensics-mobile-card">
              <div class="forensics-card-top">
                <span class="font-mono text-xs font-bold text-[var(--text-muted)]">${skill.code} // ${skill.categoryLabel}</span>
                <span class="${badgeClass}">${skill.finding}</span>
              </div>
              <h4 class="font-serif text-lg font-bold text-[var(--text-ink)]">${skill.name}</h4>
              <p class="font-sans text-xs text-[var(--text-muted)]">${skill.description}</p>
              <div class="font-mono text-[10px] text-[#766953] pt-1">Detected: <strong>${skill.detected}</strong></div>
            </div>
          `;
        }).join('');
      }
    }
  }

  // 9. CASE DOSSIER MODAL
  function initModal() {
    const modal = document.getElementById('caseModal');
    const closeBtn = document.getElementById('modalCloseBtn');
    const bottomCloseBtn = document.getElementById('modalBottomCloseBtn');

    if (closeBtn) closeBtn.addEventListener('click', closeCaseModal);
    if (bottomCloseBtn) bottomCloseBtn.addEventListener('click', closeCaseModal);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeCaseModal();
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeCaseModal();
    });
  }

  function openCaseModal(caseId) {
    const dossier = caseDossiers[caseId];
    if (!dossier) return;

    document.getElementById('modalExhibit').textContent = dossier.exhibit;
    document.getElementById('modalTitle').textContent = dossier.title;
    document.getElementById('modalDomain').textContent = dossier.domain;
    document.getElementById('modalTimeline').textContent = dossier.timeline;
    document.getElementById('modalDescription').textContent = dossier.description;

    const techContainer = document.getElementById('modalTechStack');
    if (techContainer) {
      techContainer.innerHTML = dossier.techStack.map(tech => `<span class="stamp-badge">${tech}</span>`).join('');
    }

    const metricsContainer = document.getElementById('modalMetrics');
    if (metricsContainer) {
      metricsContainer.innerHTML = dossier.metrics.map(metric => `<li class="font-sans text-sm text-[var(--text-ink)]">${metric}</li>`).join('');
    }

    const modal = document.getElementById('caseModal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCaseModal() {
    const modal = document.getElementById('caseModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  window.openCaseModal = openCaseModal;
  window.closeCaseModal = closeCaseModal;

  // 10. FLYING BROOM SCROLLBAR
  function initBroom() {
    let track = document.getElementById('flyingBroomTrack');
    if (!track) {
      track = document.createElement('div');
      track.id = 'flyingBroomTrack';
      track.className = 'flying-broom-track';
      track.innerHTML = `
        <div class="broom-guide-line"></div>
        <div id="flyingBroom" class="flying-broom-container" title="Nimbus 2000 &bull; Scroll Tracker">
          <svg class="flying-broom-svg" viewBox="0 0 40 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2 C20 2, 19 20, 19.5 40" stroke="#5c3818" stroke-width="3" stroke-linecap="round"/>
            <path d="M20 2 C20 2, 21 20, 20.5 40" stroke="#36200c" stroke-width="1" stroke-linecap="round"/>
            <rect x="16.5" y="38" width="7" height="4" rx="1" fill="#d4af37" stroke="#927114" stroke-width="0.75"/>
            <line x1="16.5" y1="40" x2="23.5" y2="40" stroke="#715408" stroke-width="0.5"/>
            <path d="M19.5 42 C16 48, 12 62, 11 76 C15 78, 25 78, 29 76 C28 62, 24 48, 20.5 42 Z" fill="#8c5828" stroke="#4a280c" stroke-width="1.2"/>
            <path d="M15 52 Q13 65 14 75" stroke="#4a280c" stroke-width="0.75" stroke-linecap="round"/>
            <path d="M20 46 Q20 62 20 77" stroke="#4a280c" stroke-width="0.75" stroke-linecap="round"/>
            <path d="M25 52 Q27 65 26 75" stroke="#4a280c" stroke-width="0.75" stroke-linecap="round"/>
            <circle cx="20" cy="18" r="1.5" fill="#f5cf7a"/>
          </svg>
        </div>
      `;
      document.body.appendChild(track);
    }

    const broomContainer = document.getElementById('flyingBroom');
    const broomSvg = broomContainer.querySelector('.flying-broom-svg');

    let currentY = 0;
    let targetY = 0;
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let currentTilt = 0;
    let isDragging = false;
    let startDragY = 0;
    let startScrollY = 0;
    let lastSparkleTime = 0;

    function updateBroomPosition() {
      const trackHeight = track.clientHeight - broomContainer.clientHeight;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

      if (maxScroll > 0 && trackHeight > 0) {
        targetY = (window.scrollY / maxScroll) * trackHeight;
      } else {
        targetY = 0;
      }

      if (isDragging) {
        currentY = targetY;
      } else {
        currentY += (targetY - currentY) * 0.35;
      }

      broomContainer.style.transform = `translate3d(0, ${currentY.toFixed(2)}px, 0)`;

      const speed = window.scrollY - lastScrollY;
      scrollVelocity += (speed - scrollVelocity) * 0.25;
      lastScrollY = window.scrollY;

      const targetTilt = Math.max(-28, Math.min(28, scrollVelocity * 0.65));
      currentTilt += (targetTilt - currentTilt) * 0.2;

      if (broomSvg) {
        broomSvg.style.transform = `rotate(${currentTilt.toFixed(2)}deg)`;
      }

      const now = performance.now();
      if (Math.abs(scrollVelocity) > 2 && now - lastSparkleTime > 120) {
        lastSparkleTime = now;
        createBroomSparkle(track, currentY);
      }

      requestAnimationFrame(updateBroomPosition);
    }
    requestAnimationFrame(updateBroomPosition);

    function createBroomSparkle(parentTrack, broomY) {
      const sparkle = document.createElement('div');
      sparkle.className = 'broom-sparkle';
      const dx = (Math.random() - 0.5) * 20;
      const dy = (Math.random() - 0.5) * 16 - 8;
      sparkle.style.setProperty('--dx', `${dx}px`);
      sparkle.style.setProperty('--dy', `${dy}px`);
      sparkle.style.left = `${(parentTrack.clientWidth / 2 - 2) + (Math.random() - 0.5) * 10}px`;
      sparkle.style.top = `${broomY + 54 + (Math.random() - 0.5) * 8}px`;
      parentTrack.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 700);
    }

    function stopDragging() {
      if (isDragging) {
        isDragging = false;
        document.documentElement.style.scrollBehavior = '';
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
      }
    }

    broomContainer.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDragging = true;
      startDragY = e.clientY;
      startScrollY = window.scrollY;
      document.documentElement.style.scrollBehavior = 'auto';
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      if (window.getSelection) {
        window.getSelection().removeAllRanges();
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const trackHeight = track.clientHeight - broomContainer.clientHeight;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (trackHeight > 0 && maxScroll > 0) {
        const deltaY = e.clientY - startDragY;
        const scrollDelta = (deltaY / trackHeight) * maxScroll;
        window.scrollTo(0, Math.max(0, Math.min(maxScroll, startScrollY + scrollDelta)));
      }
    });

    window.addEventListener('mouseup', stopDragging);

    broomContainer.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        isDragging = true;
        startDragY = e.touches[0].clientY;
        startScrollY = window.scrollY;
        document.documentElement.style.scrollBehavior = 'auto';
        if (e.cancelable) e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length === 0) return;
      if (e.cancelable) e.preventDefault();
      const trackHeight = track.clientHeight - broomContainer.clientHeight;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (trackHeight > 0 && maxScroll > 0) {
        const deltaY = e.touches[0].clientY - startDragY;
        const scrollDelta = (deltaY / trackHeight) * maxScroll;
        window.scrollTo(0, Math.max(0, Math.min(maxScroll, startScrollY + scrollDelta)));
      }
    }, { passive: false });

    window.addEventListener('touchend', stopDragging);
    window.addEventListener('touchcancel', stopDragging);
  }

  // 11. FLYING OWL COMPONENT
  function initOwl() {
    let overlay = document.getElementById('owlFlightOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'owlFlightOverlay';
      overlay.className = 'owl-flight-overlay';
      document.body.appendChild(overlay);
    }
  }

  function triggerFlyingOwl(onComplete) {
    const overlay = document.getElementById('owlFlightOverlay') || document.body;
    overlay.classList.add('active');
    overlay.innerHTML = '';

    const owlWrapper = document.createElement('div');
    owlWrapper.className = 'flying-owl-wrapper';
    owlWrapper.innerHTML = `
      <svg class="owl-body-svg" viewBox="0 0 170 130" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g class="owl-left-wing">
          <path d="M65 45 C45 20, 10 15, 2 30 C0 45, 20 65, 55 60 Z" fill="#f8fafc" stroke="#1e293b" stroke-width="2"/>
          <path d="M25 32 Q35 40 45 38" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M15 40 Q30 50 40 48" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"/>
        </g>
        <g class="owl-right-wing">
          <path d="M105 45 C125 20, 160 15, 168 30 C170 45, 150 65, 115 60 Z" fill="#f8fafc" stroke="#1e293b" stroke-width="2"/>
          <path d="M145 32 Q135 40 125 38" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M155 40 Q140 50 130 48" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"/>
        </g>
        <path d="M85 95 L78 115 L85 110 L92 115 Z" fill="#e2e8f0" stroke="#1e293b" stroke-width="1.5"/>
        <ellipse cx="85" cy="65" rx="26" ry="32" fill="#ffffff" stroke="#1e293b" stroke-width="2.5"/>
        <path d="M75 60 Q85 64 95 60" stroke="#475569" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M72 72 Q85 76 98 72" stroke="#475569" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M76 84 Q85 88 94 84" stroke="#475569" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="85" cy="38" r="20" fill="#ffffff" stroke="#1e293b" stroke-width="2.5"/>
        <circle cx="77" cy="36" r="6" fill="#fbbf24" stroke="#1e293b" stroke-width="1.5"/>
        <circle cx="77" cy="36" r="3" fill="#0f172a"/>
        <circle cx="76" cy="34" r="1" fill="#ffffff"/>
        <circle cx="93" cy="36" r="6" fill="#fbbf24" stroke="#1e293b" stroke-width="1.5"/>
        <circle cx="93" cy="36" r="3" fill="#0f172a"/>
        <circle cx="92" cy="34" r="1" fill="#ffffff"/>
        <polygon points="85,38 81,46 89,46" fill="#d97706" stroke="#1e293b" stroke-width="1"/>
        <path d="M78 95 Q76 102 80 105" stroke="#d97706" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M92 95 Q94 102 90 105" stroke="#d97706" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
      <div class="owl-letter-envelope">
        <div class="owl-wax-seal">RB</div>
      </div>
    `;

    overlay.appendChild(owlWrapper);
    playWandChime();

    const sparkleInterval = setInterval(() => {
      const rect = owlWrapper.getBoundingClientRect();
      if (rect.right > 0 && rect.left < window.innerWidth) {
        const sparkle = document.createElement('div');
        sparkle.className = 'owl-sparkle-trail';
        sparkle.style.setProperty('--ox', `${(Math.random() - 0.5) * 40 - 20}px`);
        sparkle.style.setProperty('--oy', `${(Math.random() - 0.5) * 40 + 20}px`);
        sparkle.style.left = `${rect.left + rect.width / 2 + (Math.random() - 0.5) * 20}px`;
        sparkle.style.top = `${rect.top + rect.height / 2 + (Math.random() - 0.5) * 20}px`;
        overlay.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1000);
      }
    }, 75);

    setTimeout(() => {
      clearInterval(sparkleInterval);
      overlay.classList.remove('active');
      overlay.innerHTML = '';
      if (onComplete) onComplete();
    }, 3300);
  }

  // 12. CONTACT FORM & SILENT BACKGROUND DISPATCH
  function initContact() {
    const storyInput = document.getElementById('formStory');
    const counterEl = document.getElementById('charCount');
    if (storyInput && counterEl) {
      storyInput.addEventListener('input', () => {
        counterEl.textContent = `${storyInput.value.length} / 1000 characters`;
      });
    }

    const form = document.getElementById('contactForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('formName').value.trim();
        const email = document.getElementById('formEmail').value.trim();
        const subject = document.getElementById('formSubject').value.trim();
        const story = document.getElementById('formStory').value.trim();
        const submitBtn = form.querySelector('button[type="submit"]');

        if (!name || !email || !subject || !story) {
          showToast('⚠️ Please fill out all required fields before sending the owl.');
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'DISPATCHING OWL...';
        }

        showToast('🦉 The Owl takes flight carrying your letter...');

        // Silent background dispatch via Formspree API (NO Gmail redirect)
        fetch('https://formspree.io/f/mvkozeqz', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: name,
            email: email,
            subject: subject,
            message: story
          })
        }).catch(err => console.warn('Silent dispatch notification:', err));

        // Trigger flying owl animation
        triggerFlyingOwl(() => {
          form.innerHTML = `
            <div class="p-6 border-2 border-[var(--border-ink)] bg-[var(--bg-parchment-light)] text-center space-y-3">
              <div class="stamp-distressed text-xs">DISPATCH CONFIRMED</div>
              <h4 class="font-serif text-2xl font-bold text-[var(--text-ink)]">Owl Delivered Successfully</h4>
              <p class="font-sans text-sm text-[var(--text-muted)] leading-relaxed">
                Thank you, <strong>${name}</strong>! Your dispatch has been delivered directly into Rishi&rsquo;s personal inbox. You will receive a response at <strong>${email}</strong> usually within 24 hours.
              </p>
              <div class="pt-2">
                <button onclick="location.reload()" class="btn-ink text-xs">SEND ANOTHER LETTER &rarr;</button>
              </div>
            </div>
          `;
          showToast('✉️ Owl Delivered into Rishi’s Inbox!');
        });
      });
    }

    document.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const textToCopy = btn.getAttribute('data-copy');
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`📋 Copied "${textToCopy}" to clipboard!`);
        }).catch(() => {
          showToast(`📋 ${textToCopy}`);
        });
      });
    });
  }

  function showToast(message) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // 13. DOM READY BOOTSTRAP
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initAudio();
    initNavigation();
    initMasthead();
    initPortrait();
    initArticles();
    initLabReport();
    initModal();
    initContact();
    initBroom();
    initOwl();
    console.log('🗞️ Broadsheet Edition Portfolio initialized successfully with Nimbus Broom & Owl dispatch.');
  });

})();
