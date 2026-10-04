/**
 * Station Panel Component
 * Detailed case-study panel sliding over railway stage with tabs, metrics, and spell actions.
 */

import { openCaseModal } from '../components/modal.js';
import { playSfx } from '../core/audio.js';
import { showToast } from '../core/dom.js';

let cleanups = [];
let revelioRevealed = false;

export function renderStation(panelEl, project) {
  if (!panelEl || !project) return;
  revelioRevealed = false;

  const demoBadge = project.isDemo
    ? `<span class="stamp-distressed text-[9px] px-2 py-0.5">DEMO CASE FILE</span>`
    : `<span class="stamp-distressed text-[9px] px-2 py-0.5 text-emerald-700 border-emerald-700">VERIFIED ARCHITECTURE</span>`;

  panelEl.innerHTML = `
    <div class="panel-inner-scroll">
      <!-- Panel Header Bar -->
      <div class="panel-header-bar">
        <div>
          <div class="panel-eyebrow">
            <span>STATION ${project.number} &bull; ${project.category.toUpperCase()}</span>
            ${demoBadge}
          </div>
          <h2 class="panel-station-title">${project.station}</h2>
          <div class="panel-project-sub">${project.title}</div>
        </div>
        <button id="panelReturnBtn" class="btn-panel-return" title="Collapse Panel (Return to Railway)">
          &times;
        </button>
      </div>

      <!-- Station World Accent Stripe -->
      <div class="panel-accent-stripe" style="background: linear-gradient(90deg, ${project.theme.accent}, ${project.theme.lantern});"></div>

      <!-- Main Dossier Content Body -->
      <div class="panel-grid-layout">
        
        <!-- Column 1: The Spell (Problem) & Architecture Steps -->
        <div class="panel-col space-y-5">
          <!-- 1. The Spell -->
          <div class="panel-card-box">
            <div class="panel-section-tag">&bull; THE SPELL // CHALLENGE</div>
            <h3 class="panel-card-heading">${project.spell.heading}</h3>
            <p class="panel-card-body">${project.spell.body}</p>
          </div>

          <!-- 2. The Incantation (Architecture Steps) -->
          <div class="panel-card-box">
            <div class="panel-section-tag">&bull; THE INCANTATION // ARCHITECTURE</div>
            <h3 class="panel-card-heading">${project.incantation.heading}</h3>
            <p class="panel-card-body mb-3">${project.incantation.body}</p>

            <!-- CSS Flow Diagram from Steps -->
            <div class="incantation-flow-steps">
              ${project.incantation.steps.map((step, idx) => `
                <div class="flow-step-item">
                  <div class="flow-step-dot">${idx + 1}</div>
                  <div class="flow-step-text">${step}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 3. Revelio Secret Disclosure Area -->
          <div class="panel-card-box revelio-box" id="revelioSecretBox">
            <div class="flex items-center justify-between mb-2">
              <span class="panel-section-tag">&bull; CLASSIFIED DISCLOSURE</span>
              <button id="btnRevelioToggle" class="btn-spell-action" data-spell="revelio">
                <span class="spell-sparkle">✦</span>
                <span>REVELIO</span>
              </button>
            </div>
            <div class="revelio-hidden-text" id="revelioText">
              ${project.reveal}
            </div>
          </div>
        </div>

        <!-- Column 2: Ingredients, Metrics & Mockup Artifact -->
        <div class="panel-col space-y-5">
          <!-- 4. Ingredients (Tech Stack Chips) -->
          <div class="panel-card-box">
            <div class="panel-section-tag">&bull; INGREDIENTS // ARSENAL</div>
            <div class="panel-tech-chips">
              ${project.technologies.map(t => `<span class="tech-potion-chip">${t}</span>`).join('')}
            </div>
          </div>

          <!-- 5. Metrics Matrix -->
          <div class="panel-card-box">
            <div class="panel-section-tag">&bull; RESULT // QUANTIFIED IMPACT</div>
            <p class="font-sans text-xs text-[var(--text-muted)] mb-3">${project.result.summary}</p>
            <div class="panel-metrics-grid">
              ${project.result.metrics.map(m => `
                <div class="metric-tile">
                  <div class="metric-value">${m.value}</div>
                  <div class="metric-label">${m.label}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 6. Architectural Artifact Thumbnail -->
          ${project.artifacts && project.artifacts.length > 0 ? `
            <div class="panel-card-box artifact-card-box">
              <div class="panel-section-tag">&bull; ARTIFACT // BLUEPRINT</div>
              <div class="artifact-thumb-wrap" id="panelArtifactWrap" title="Click to inspect in Case Dossier">
                <img 
                  src="${project.artifacts[0].src}" 
                  alt="${project.artifacts[0].alt}" 
                  class="artifact-img" 
                  loading="lazy" 
                  decoding="async"
                  width="600"
                  height="380"
                />
                <div class="artifact-caption">${project.artifacts[0].caption}</div>
              </div>
            </div>
          ` : ''}

        </div>

      </div>

      <!-- Action Footer Toolbar -->
      <div class="panel-footer-toolbar">
        <div class="panel-actions-left">
          <button id="btnAlohomora" class="btn-spell-action" data-spell="alohomora" title="Open Full Forensic Case Dossier">
            <span>ALOHOMORA DOSSIER</span>
            <span class="font-mono text-xs">&nearr;</span>
          </button>
        </div>

        <div class="panel-actions-right">
          ${project.github ? `
            <a href="${project.github}" target="_blank" rel="noopener" class="btn-stamp-link" title="Accio Source Code">
              <span>ACCIO SOURCE</span>
              <span class="font-mono text-xs">&nearr;</span>
            </a>
          ` : `
            <button class="btn-stamp-link opacity-50 cursor-not-allowed" disabled title="Source protected under enterprise proprietary NDA">
              ACCIO SOURCE (PROPRIETARY)
            </button>
          `}

          ${project.demo ? `
            <button id="btnPortkeyDemo" class="btn-ink text-xs" data-demo-url="${project.demo}">
              PORTKEY (LIVE DEMO) &rarr;
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  // Bind panel interactions
  bindPanelEvents(panelEl, project);
}

function bindPanelEvents(panelEl, project) {
  const returnBtn = document.getElementById('panelReturnBtn');
  if (returnBtn) {
    returnBtn.addEventListener('click', () => {
      panelEl.classList.remove('open');
      playSfx('paper');
    });
  }

  // Revelio button
  const revelioBtn = document.getElementById('btnRevelioToggle');
  const revelioBox = document.getElementById('revelioSecretBox');
  if (revelioBtn && revelioBox) {
    revelioBtn.addEventListener('click', () => {
      revelioRevealed = !revelioRevealed;
      playSfx('wand');
      if (revelioRevealed) {
        revelioBox.classList.add('revealed');
        showToast('✦ Revelio! Hidden engineering parameters revealed.');
      } else {
        revelioBox.classList.remove('revealed');
      }
    });
  }

  // Alohomora Dossier
  const alohomoraBtn = document.getElementById('btnAlohomora');
  const artifactWrap = document.getElementById('panelArtifactWrap');
  const openDossierHandler = () => {
    openCaseModal(project.id);
  };
  if (alohomoraBtn) alohomoraBtn.addEventListener('click', openDossierHandler);
  if (artifactWrap) artifactWrap.addEventListener('click', openDossierHandler);

  // Portkey Live Demo
  const portkeyBtn = document.getElementById('btnPortkeyDemo');
  if (portkeyBtn) {
    portkeyBtn.addEventListener('click', () => {
      const url = portkeyBtn.getAttribute('data-demo-url');
      if (!url) return;
      playSfx('whistle');
      showToast('🌀 Portkey enchanted! Transporting to live demo...');
      setTimeout(() => {
        if (url.startsWith('#')) {
          const el = document.querySelector(url);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.open(url, '_blank', 'noopener');
        }
      }, 400);
    });
  }
}
