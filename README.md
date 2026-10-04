# Rishi Bhardvaj — The Wizarding Railway & Daily Chronicle

An interactive, data-driven broadsheet portfolio and cinematic railway experience celebrating software engineering, distributed systems, and backend craftsmanship. Built with a vintage linotype newspaper aesthetic, an interactive "Hogwarts Express"-style railway chronicle, synthesized Web Audio acoustics, and zero build step.

---

## 🚂 Architectural Highlights & Features

1. **The Wizarding Railway (Stations = Projects)**:
   - A pinned cinematic railway: scrolling drives the train station to station (snapping to each), with parallax scenery, turning wheels and steam. Buttons, arrow keys and swipe travel too.
   - Interactive parchment route map with live track progress and glowing stop seals.
   - Locomotive steam audio, departure bells, and platform arrival soundscapes.
   - Each station shows an arrival board; ENTER STATION opens a walkthrough drawer (The Spell, Ingredients, Incantation, Result, Artifacts, REVELIO).
   - Keyboard arrows, touch swipe, pointer dragging, and HUD controls.

2. **The "Add One Object" Data Architecture**:
   - Adding a single object to `assets/js/data/projects.js` automatically mounts the station, route map node, newspaper broadsheet card, and investigative dossier modal.
   - Zero hardcoding across template views.

3. **14 Castable Spells & Interactive Spellbook**:
   - Full spell registry (`Lumos`, `Nox`, `Revelio`, `Accio`, `Alohomora`, `Protego`, `Wingardium`, `Reparo`, `Obliviate`, `Prior Incantato`, `Expecto Patronum`, `Portkey`, `Finite Incantatem`, `Morsmordre`).
   - Global keyboard shortcuts and dedicated `?` spellbook popover.
   - `Protego` station lock shields navigation against accidental movement.

4. **Authentic Marauder's Map Navigation**:
   - Accessible via footer link *"I solemnly swear that I am up to no good"* or typing `mischief`.
   - Fullscreen fold-out parchment blueprint drawing coordinates from `data/navigation.js`.
   - Dynamic SVG corridor lines, animated pacing footprints, and wandering engineer ribbon.
   - Clicking any chamber smoothly transports the user to that section with *"Mischief managed."*

5. **Pure Web Audio Acoustic Synthesis**:
   - Zero external audio files or copyrighted melodies.
   - Live synthesis via Web Audio API oscillators, bandpass filters, and noise bursts.
   - Off by default (`masterGain <= 0.25`), user-opt-in, respecting background tab visibility.
   - Soundscapes: locomotive steam chug, brass bell, steam whistle, paper rustle, linotype typewriter click, wax seal fracture, and nocturnal owl hoots.

6. **Easter Eggs & Secret Chambers**:
   - **Seven Strikes of the Crest**: Tapping the masthead crest emblem 7 times breaks the tamper seal, unlocking the secret 7th station (*The Room of Requirement*).
   - **Keyboard Sequences**: Typing `morsmordre`, `patronus`, `lumos`, `nox`, `mischief`, or `finite` triggers harmless atmospheric apparitions.
   - **Interactive Wand Cursor**: Luminous wand-tip follower with starlight click sparks (fine-pointer only).
   - **Clickable Footer Owl**: Gentle synthesized hooting animation.

7. **Full Accessibility & Reduced-Motion Fidelity**:
   - WCAG-compliant high-contrast focus rings and modal focus traps (`trapFocus`).
   - ARIA live announcements for toasts and station arrivals.
   - Automatic `@media (prefers-reduced-motion: reduce)` overrides disabling all loops, parallax, and disorienting translations.

---

## 📁 Repository Structure

```
Rishi-Portfolio/
├── index.html                       # Semantic broadsheet shell & mounting nodes
├── package.json                     # Dev script ("dev": "npx serve .")
├── README.md                        # Documentation & technical guide
├── assets/
│   ├── css/
│   │   ├── variables.css            # Design tokens, color palette, z-index scale
│   │   ├── base.css                 # Base resets, paper texture, focus rings, reduced-motion
│   │   ├── styles.css               # Core linotype styles & broadsheet grid
│   │   └── components/
│   │       ├── hero.css             # 3-column broadsheet story, moving portrait, dust motes
│   │       ├── railway.css          # Pinned railway stage, train sprite, platform gates
│   │       ├── route-map.css        # Interactive parchment railway line & stop nodes
│   │       ├── station.css          # Station case study panel & Revelio secrets
│   │       ├── dossier.css          # Wax-sealed case dossier popup modal
│   │       ├── spells.css           # Wand animations, spellbook popover, badges
│   │       ├── lab-report.css       # Substance cabinet, SVG potion phials, table & cards
│   │       ├── ledger.css           # Expandable movements accordion
│   │       ├── marauder.css         # Antique fold-out parchment map & footprints
│   │       ├── cursor.css           # Wand-tip glow follower & starlight click sparks
│   │       ├── eggs.css             # Morsmordre, Patronus, and crest fracture overlays
│   │       ├── broom.css            # Nimbus scroll position tracker
│   │       └── owl.css              # Post owl dispatch flight animation
│   ├── js/
│   │   ├── main.js                  # Application orchestrator (<100 lines)
│   │   ├── core/
│   │   │   ├── store.js             # Reactive pub/sub state manager
│   │   │   ├── dom.js               # Toast notifications, focus traps, DOM helpers
│   │   │   ├── motion.js            # prefers-reduced-motion detector & safety guards
│   │   │   ├── audio.js             # Synthesized Web Audio API sound engine
│   │   │   └── events.js            # Managed lifecycle event bus
│   │   ├── data/
│   │   │   ├── projects.js          # Single source of truth for railway stations & dossiers
│   │   │   ├── skills.js            # Lab report forensics substances & cabinet shelves
│   │   │   ├── experience.js        # Career movements & accordion items
│   │   │   ├── stats.js             # Masthead edition metrics
│   │   │   ├── ticker.js            # Telegram wire breaking news items
│   │   │   ├── contact.js           # Owl post endpoints & direct wire
│   │   │   ├── site.js              # Broadsheet titles, editions, and navigation labels
│   │   │   ├── navigation.js        # Section coordinates for scroll-spy & Marauder map
│   │   │   └── spells.js            # 14 castable incantations & hotkeys
│   │   ├── railway/
│   │   │   ├── index.js             # Railway master orchestrator
│   │   │   ├── scene.js             # Stage markup (world, train, HUD, gate, drawer)
│   │   │   ├── art.js               # Procedural SVG: parallax world tiles & the steam train
│   │   │   ├── journey.js           # Engine: scroll-scrubbed travel, boarding, input, drawer, Protego
│   │   │   ├── route-map.js         # Parchment track & station nodes (generated from data)
│   │   │   ├── station-panel.js     # Station card + walkthrough drawer renderers
│   │   │   └── sfx.js               # Railway acoustic wrappers
│   │   └── components/
│   │       ├── theme.js             # Lumos/Nox edition switcher
│   │       ├── audio.js             # UI sound toggles & mute controller
│   │       ├── navigation.js        # Mobile drawer, smooth scroll & spy
│   │       ├── masthead.js          # Dynamic date, ear stamps, and currency counters
│   │       ├── portrait.js          # Moving photograph parallax & linotype modes
│   │       ├── articles.js          # Broadsheet case file cards & SVG chart
│   │       ├── lab-report.js        # Potion cabinet shelves & forensics filter
│   │       ├── ledger.js            # Smooth zero-thrash accordion timeline
│   │       ├── dossier.js           # Case dossier dialog & wax seal animation
│   │       ├── modal.js             # Dossier modal facade
│   │       ├── contact.js           # Owl post form validation & honeypot
│   │       ├── owl.js               # Flying post owl letter dispatch
│   │       ├── broom.js             # Scroll progress broom flight
│   │       ├── spell-bar.js         # Spell dispatcher & spellbook popover
│   │       ├── marauder.js          # Marauder's Map interactive floorplan
│   │       ├── cursor.js            # Interactive wand cursor follower & sparks
│   │       └── easter-eggs.js       # Typing sequence buffer & 7-strike crest unlock
│   └── images/
│       ├── rishi_vintage_photo.png  # Authentic framed newspaper portrait
│       └── projects/                # Vector SVG mockup blueprints
│           ├── finacle-core.svg
│           ├── order-management.svg
│           ├── risheesh.svg
│           ├── devops-forge.svg
│           ├── vision-lab.svg
│           ├── marauders-archive.svg
│           └── room-of-requirement.svg
```

---

## 🛠️ Adding a New Project (The "Add One Object" Guarantee)

To add a new station along the railway line, simply append an entry to `rawProjects` in `assets/js/data/projects.js`:

```javascript
{
  id: 'my-new-project',
  order: 7,
  station: 'NEW STATION NAME',
  number: '07',
  category: 'Distributed Systems',
  categoryKey: 'backend', // 'banking' | 'fullstack' | 'automation' | 'devops' | 'research' | 'experimental'
  title: 'High-Throughput Message Queue Pipeline',
  summary: 'Engineered an asynchronous event broker handling 250,000 events/sec with sub-millisecond replication.',
  description: 'Full architectural disclosure detailing partition sharding, consensus protocols, and persistence.',
  status: 'shipped', // 'shipped' | 'in-progress' | 'archived' | 'demo'
  isDemo: false,
  featured: false,
  hidden: false,
  technologies: ['Java 21', 'Kafka', 'PostgreSQL', 'Docker', 'Kubernetes'],
  spell: {
    heading: 'The Bottleneck Latency',
    body: 'Inter-service communication bottlenecks were degrading customer checkout SLAs.'
  },
  incantation: {
    heading: 'Asynchronous Event Broker Architecture',
    body: 'Replaced synchronous REST handshakes with distributed event streaming.',
    steps: [
      '1. Partition Sharding by Client ID',
      '2. In-Memory Write-Ahead Log Buffering',
      '3. Raft Leader Election & Quorum Replication',
      '4. Idempotent Consumer Commit Hooks'
    ]
  },
  result: {
    summary: 'Slashed median latency by 85% and eliminated cascade failures.',
    metrics: [
      { label: 'Throughput', value: '250k/s' },
      { label: 'Latency P99', value: '4ms' },
      { label: 'Uptime', value: '99.99%' },
      { label: 'Data Loss', value: '0.00%' }
    ]
  },
  artifacts: [
    {
      src: 'assets/images/projects/my-new-project.svg',
      alt: 'Architecture Diagram',
      caption: 'Event broker cluster and partition sharding topology'
    }
  ],
  reveal: 'Employed custom ring buffers to achieve zero-allocation GC overhead during peak spikes.',
  github: 'https://github.com/rishi-bhardvaj',
  demo: null,
  theme: {
    sky: '#0f172a',
    accent: '#38bdf8',
    lantern: '#60a5fa'
  }
}
```

The new station will immediately render across:
1. The pinned railway platform & station panel.
2. The parchment route map track.
3. The broadsheet case file grid.
4. The interactive case dossier modal.

---

## 🚀 Running Locally

Because this project utilizes native ES modules (`<script type="module">`), opening directly via `file:///` is restricted by browser CORS security policies. Serve it using any local static file server:

```bash
# Using Node (bundled package.json dev script)
npm run dev

# Or with npx serve
npx serve .

# Or using Python 3
python -m http.server 8000
```

Then visit `http://localhost:8000` (or the URL printed by your server) in any modern browser.

---

## 📜 Compliance & Verification

- **Zero External Audio Assets**: All audio is synthesized in real-time through the Web Audio API.
- **Copyright Integrity**: Free of third-party audio recordings, proprietary soundtrack melodies, or unauthorized assets.
- **Zero Forbidden References**: Fully verified with 0 results across grep gates.
- **Zero Build Step**: Native browser-first modern JavaScript, semantic HTML5, and vanilla CSS tokens.
