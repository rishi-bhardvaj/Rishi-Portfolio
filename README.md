# Rishi Bhardvaj — The Daily Prophet Broadsheet Edition

An authentic, fully responsive, and dynamic vintage wizarding broadsheet newspaper portfolio inspired by Victorian linotype, *The Daily Prophet* front-page archives, and forensic case dossiers.

---

## 🗞️ Architectural Highlights & Features

1. **📱 100% Fully Responsive Layout**:
   - Engineered to render flawlessly across all viewports: Mobile (iPhone SE, Android, iPhone 14 Pro Max), Tablets (iPad/Android tablets), and ultra-wide Desktop displays.
   - Includes a dedicated mobile parchment slide-out drawer navigation with quick touch access to sections, theme toggles, and direct dispatch links.

2. **⚡ Dynamic & Interactive Experience**:
   - **Lumos / Nox Mode**: Instant broadsheet edition switcher (Day Golden Parchment vs Night Nocturnal Auror Edition) with `localStorage` memory.
   - **Live Breaking News Ticker**: Smoothly animated telegram wire ribbon displaying real-time updates and metrics.
   - **Real-Time Issue Date & Concurrency Monitor**: Dynamic issue date generator and live simulated Bangalore Core concurrency health monitor.
   - **Magical Moving Photograph**: Authentic *Daily Prophet* moving portrait effect with 3D mouse parallax tilt and interactive linotype/daguerreotype filter modes.
   - **Dynamic Case Files Explorer**: Filter investigative dispatches by category (*Core Banking, Full-Stack & Cloud, DevOps, Research*) with animated card transitions.
   - **Interactive Performance SVG Chart**: Visual line chart comparing legacy vs optimized build times with live hover tooltips.
   - **Live Forensics Lab Search**: Real-time searchable and category-filter-ready skills matrix with responsive desktop table and mobile cards view.
   - **Interactive Case File Dossier Dialog**: Deep-dive popup modal with comprehensive tech stacks and impact metrics.
   - **Zero-Dependency Synthesized Audio**: Web Audio API-powered authentic vintage newspaper page rustles and rubber stamp thuds (with mute toggle).
   - **Letters & Commissions (Submit an Owl)**: Dynamic form validation, live character counter, copy-to-clipboard badges, and toast alert notifications.

3. **🧩 Clean Modular Component Architecture**:
   - Fully separated CSS and JavaScript component files for maximum maintainability and extensibility.

---

## 📁 Modular Directory Structure

```
rishi_bhardvaj_portfolio_v2/
├── index.html                       # Semantic Daily Prophet Broadsheet HTML
├── assets/
│   ├── css/
│   │   ├── variables.css            # Design tokens, color palette, Lumos/Nox themes
│   │   ├── base.css                 # Base resets, parchment textures, stamps, buttons
│   │   ├── styles.css               # Master stylesheet bundle
│   │   └── components/
│   │       ├── nav.css              # Sticky vintage nav, mobile drawer, progress bar
│   │       ├── ticker.css           # Live breaking news marquee telegram ribbon
│   │       ├── masthead.css         # Daily Prophet Gothic header, crests, 4-ear grid
│   │       ├── hero.css             # 3-column broadsheet story, moving portrait
│   │       ├── articles.css         # Case files grid, filter tabs, SVG chart
│   │       ├── lab-report.css       # Forensics search bar, table & mobile cards
│   │       ├── ledger.css           # Career whereabouts chronological timeline
│   │       ├── contact.css          # Dossier owl dispatch card, toast alerts
│   │       ├── modal.css            # Case file dossier popup dialog
│   │       └── footer.css           # Dark linotype footer, bottom index bar
│   ├── js/
│   │   ├── main.js                  # Application bootstrap & orchestrator
│   │   ├── data/
│   │   │   ├── dossiers.js          # Case files data store
│   │   │   └── skills.js            # Forensics substances & skills data store
│   │   └── components/
│   │       ├── theme.js             # Lumos/Nox switcher & storage
│   │       ├── audio.js             # Synthesized Web Audio API sound generator
│   │       ├── navigation.js        # Mobile drawer, smooth scroll & spy
│   │       ├── masthead.js          # Live date & concurrency monitor
│   │       ├── portrait.js          # Moving photograph parallax & filters
│   │       ├── articles.js          # Dynamic case files rendering & chart
│   │       ├── lab-report.js        # Live forensics search & filter engine
│   │       ├── modal.js             # Dossier popup dialog manager
│   │       └── contact.js           # Form validation, copy badges, toasts
│   └── images/
│       ├── rishi_profile.png        # Profile portrait asset
│       └── rishi_vintage_photo.png  # Vintage framed portrait asset
└── README.md                        # Documentation & setup guide
```

---

## 🚀 Quick Start & Deployment

- Open `index.html` in any modern web browser or run a lightweight local server (e.g. `npx serve .` or VSCode Live Server).
- Zero external build dependencies required.
- Ready for instant 1-click deployment to **GitHub Pages**, **Vercel**, **Cloudflare Pages**, or **Netlify**.
