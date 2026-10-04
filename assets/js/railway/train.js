/**
 * Train Component (SVG & CSS Locomotive + Carriages)
 * Original editorial Hogwarts Express-inspired steam railway design.
 */

import { projects } from '../data/projects.js';

export function createTrainMarkup() {
  const visibleProjects = projects.filter(p => !p.hidden);

  return `
    <div class="train-assembly" id="trainAssembly">
      <!-- Steam Puffs Emitter (Canvas-free DOM puffs) -->
      <div class="steam-emitter" id="steamEmitter" aria-hidden="true">
        <div class="steam-puff puff-1"></div>
        <div class="steam-puff puff-2"></div>
        <div class="steam-puff puff-3"></div>
        <div class="steam-puff puff-4"></div>
        <div class="steam-puff puff-5"></div>
        <div class="steam-puff puff-6"></div>
      </div>

      <!-- Train Master SVG Sprite -->
      <svg class="train-svg" viewBox="0 0 1600 240" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMid meet">
        <defs>
          <!-- Locomotive Gradients -->
          <linearGradient id="locoBodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#8a182b"/>
            <stop offset="60%" stop-color="#6e1423"/>
            <stop offset="100%" stop-color="#470b16"/>
          </linearGradient>
          <linearGradient id="boilerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3a322d"/>
            <stop offset="45%" stop-color="#1c1815"/>
            <stop offset="100%" stop-color="#0e0c0b"/>
          </linearGradient>
          <linearGradient id="brassGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="50%" stop-color="#d4af37"/>
            <stop offset="100%" stop-color="#927114"/>
          </linearGradient>
          <linearGradient id="carriageUpper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fdfbf7"/>
            <stop offset="100%" stop-color="#e8dcbe"/>
          </linearGradient>
          <linearGradient id="carriageLower" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#801526"/>
            <stop offset="100%" stop-color="#540e1b"/>
          </linearGradient>
          <linearGradient id="windowGlowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fffbeb"/>
            <stop offset="50%" stop-color="#fef08a"/>
            <stop offset="100%" stop-color="#f59e0b"/>
          </linearGradient>
        </defs>

        <!-- 1. STEAM LOCOMOTIVE (Rightmost / Front of train facing Right) -->
        <g id="locomotive" transform="translate(1180, 0)">
          <!-- Cowcatcher / Pilot -->
          <polygon points="350,185 390,195 385,200 330,200" fill="#181412" stroke="#b08d3c" stroke-width="1.5"/>
          <line x1="345" y1="187" x2="355" y2="200" stroke="#b08d3c" stroke-width="1.5"/>
          <line x1="360" y1="190" x2="370" y2="200" stroke="#b08d3c" stroke-width="1.5"/>

          <!-- Main Boiler (Black & Brass Bands) -->
          <rect x="140" y="80" width="210" height="95" rx="10" fill="url(#boilerGrad)" stroke="#181412" stroke-width="2"/>
          
          <!-- Brass Boiler Bands -->
          <rect x="175" y="78" width="6" height="99" rx="1" fill="url(#brassGrad)"/>
          <rect x="235" y="78" width="6" height="99" rx="1" fill="url(#brassGrad)"/>
          <rect x="295" y="78" width="6" height="99" rx="1" fill="url(#brassGrad)"/>

          <!-- Steam Smokestack / Chimney -->
          <path d="M315,80 L318,35 L338,30 L342,80 Z" fill="url(#boilerGrad)" stroke="#181412" stroke-width="1.5"/>
          <ellipse cx="328" cy="30" rx="12" ry="4" fill="url(#brassGrad)"/>

          <!-- Steam Dome & Sand Dome -->
          <path d="M260,80 C260,50 280,50 280,80 Z" fill="url(#brassGrad)" stroke="#927114" stroke-width="1"/>
          <path d="M195,80 C195,58 215,58 215,80 Z" fill="url(#brassGrad)" stroke="#927114" stroke-width="1"/>

          <!-- Headlamp with Golden Light Beam -->
          <g transform="translate(350, 95)">
            <rect x="0" y="0" width="22" height="26" rx="3" fill="#181412" stroke="url(#brassGrad)" stroke-width="1.5"/>
            <circle cx="11" cy="13" r="8" fill="#fef08a"/>
            <!-- Forward Light Cone -->
            <polygon points="22,13 140,-25 140,55" fill="rgba(254, 240, 138, 0.18)" class="headlamp-beam"/>
          </g>

          <!-- Driver Cab (Burgundy & Warm Window) -->
          <path d="M40,50 L145,50 L145,175 L40,175 Z" fill="url(#locoBodyGrad)" stroke="#b08d3c" stroke-width="2"/>
          <!-- Cab Overhang Roof -->
          <path d="M35,46 L150,46 L145,52 L38,52 Z" fill="#241417"/>
          <!-- Cab Windows -->
          <rect x="58" y="66" width="34" height="42" rx="4" fill="url(#windowGlowGrad)" stroke="#470b16" stroke-width="1.5"/>
          <rect x="100" y="66" width="34" height="42" rx="4" fill="url(#windowGlowGrad)" stroke="#470b16" stroke-width="1.5"/>

          <!-- Brass Nameplate -->
          <rect x="190" y="115" width="85" height="18" rx="3" fill="#181412" stroke="url(#brassGrad)" stroke-width="1.5"/>
          <text x="232" y="128" font-family="'Space Mono', monospace" font-size="8" fill="#fef08a" font-weight="bold" text-anchor="middle">RISHI EXPR.</text>

          <!-- Wheel Frame Underbody -->
          <rect x="35" y="172" width="320" height="12" rx="2" fill="#181412"/>

          <!-- Wheels Group (Class toggled for rotation) -->
          <g class="train-wheels" transform="translate(0, 0)">
            <!-- Driving Wheel 1 -->
            <g transform="translate(85, 185)">
              <circle cx="0" cy="0" r="24" fill="#221b18" stroke="url(#brassGrad)" stroke-width="3"/>
              <line x1="-22" y1="0" x2="22" y2="0" stroke="#d4af37" stroke-width="2"/>
              <line x1="0" y1="-22" x2="0" y2="22" stroke="#d4af37" stroke-width="2"/>
              <line x1="-15" y1="-15" x2="15" y2="15" stroke="#d4af37" stroke-width="1.5"/>
              <line x1="-15" y1="15" x2="15" y2="-15" stroke="#d4af37" stroke-width="1.5"/>
              <circle cx="0" cy="0" r="7" fill="url(#brassGrad)"/>
            </g>
            <!-- Driving Wheel 2 -->
            <g transform="translate(155, 185)">
              <circle cx="0" cy="0" r="24" fill="#221b18" stroke="url(#brassGrad)" stroke-width="3"/>
              <line x1="-22" y1="0" x2="22" y2="0" stroke="#d4af37" stroke-width="2"/>
              <line x1="0" y1="-22" x2="0" y2="22" stroke="#d4af37" stroke-width="2"/>
              <line x1="-15" y1="-15" x2="15" y2="15" stroke="#d4af37" stroke-width="1.5"/>
              <line x1="-15" y1="15" x2="15" y2="-15" stroke="#d4af37" stroke-width="1.5"/>
              <circle cx="0" cy="0" r="7" fill="url(#brassGrad)"/>
            </g>
            <!-- Driving Wheel 3 -->
            <g transform="translate(225, 185)">
              <circle cx="0" cy="0" r="24" fill="#221b18" stroke="url(#brassGrad)" stroke-width="3"/>
              <line x1="-22" y1="0" x2="22" y2="0" stroke="#d4af37" stroke-width="2"/>
              <line x1="0" y1="-22" x2="0" y2="22" stroke="#d4af37" stroke-width="2"/>
              <line x1="-15" y1="-15" x2="15" y2="15" stroke="#d4af37" stroke-width="1.5"/>
              <line x1="-15" y1="15" x2="15" y2="-15" stroke="#d4af37" stroke-width="1.5"/>
              <circle cx="0" cy="0" r="7" fill="url(#brassGrad)"/>
            </g>
            <!-- Front Bogie Wheels (Smaller) -->
            <g transform="translate(295, 192)">
              <circle cx="0" cy="0" r="14" fill="#221b18" stroke="url(#brassGrad)" stroke-width="2"/>
              <circle cx="0" cy="0" r="4" fill="url(#brassGrad)"/>
            </g>
            <g transform="translate(330, 192)">
              <circle cx="0" cy="0" r="14" fill="#221b18" stroke="url(#brassGrad)" stroke-width="2"/>
              <circle cx="0" cy="0" r="4" fill="url(#brassGrad)"/>
            </g>
            <!-- Side Rod / Connecting Rod -->
            <line x1="85" y1="185" x2="225" y2="185" stroke="#fef08a" stroke-width="4" stroke-linecap="round"/>
          </g>

          <!-- Coupler to tender/carriages -->
          <rect x="15" y="165" width="25" height="8" rx="2" fill="#181412"/>
        </g>

        <!-- 2. CARRIAGE 1 (Finacle Core / Banking) -->
        ${renderCarriage(830, visibleProjects[0], '01')}

        <!-- 3. CARRIAGE 2 (Order Management) -->
        ${renderCarriage(480, visibleProjects[1], '02')}

        <!-- 4. CARRIAGE 3 (Risheesh Automation) -->
        ${renderCarriage(130, visibleProjects[2], '03')}
      </svg>
    </div>
  `;
}

function renderCarriage(offsetX, project, defaultNum) {
  const stationName = project ? project.station : `STATION ${defaultNum}`;
  const stnNum = project ? project.number : defaultNum;

  return `
    <g class="train-carriage" transform="translate(${offsetX}, 0)">
      <!-- Coupler linking to next -->
      <rect x="-20" y="165" width="25" height="8" rx="2" fill="#181412"/>

      <!-- Roof -->
      <path d="M5,70 Q165,58 325,70 L325,76 L5,76 Z" fill="#2a1d20" stroke="#181412" stroke-width="1.5"/>

      <!-- Upper Carriage Body (Cream) -->
      <rect x="5" y="76" width="320" height="52" fill="url(#carriageUpper)" stroke="#b08d3c" stroke-width="1.5"/>

      <!-- 4 Glowing Warm Windows -->
      <rect x="25" y="84" width="46" height="36" rx="4" fill="url(#windowGlowGrad)" stroke="#470b16" stroke-width="1.5"/>
      <rect x="100" y="84" width="46" height="36" rx="4" fill="url(#windowGlowGrad)" stroke="#470b16" stroke-width="1.5"/>
      <rect x="180" y="84" width="46" height="36" rx="4" fill="url(#windowGlowGrad)" stroke="#470b16" stroke-width="1.5"/>
      <rect x="255" y="84" width="46" height="36" rx="4" fill="url(#windowGlowGrad)" stroke="#470b16" stroke-width="1.5"/>

      <!-- Window mullions -->
      <line x1="48" y1="84" x2="48" y2="120" stroke="#470b16" stroke-width="1"/>
      <line x1="123" y1="84" x2="123" y2="120" stroke="#470b16" stroke-width="1"/>
      <line x1="203" y1="84" x2="203" y2="120" stroke="#470b16" stroke-width="1"/>
      <line x1="278" y1="84" x2="278" y2="120" stroke="#470b16" stroke-width="1"/>

      <!-- Lower Carriage Body (Deep Burgundy) -->
      <rect x="5" y="128" width="320" height="48" fill="url(#carriageLower)" stroke="#b08d3c" stroke-width="1.5"/>

      <!-- Gold Plate Ribbon & Inscription -->
      <rect x="70" y="138" width="190" height="20" rx="3" fill="#181412" stroke="url(#brassGrad)" stroke-width="1.5"/>
      <text x="165" y="152" font-family="'Space Mono', monospace" font-size="8.5" fill="#fef08a" font-weight="bold" text-anchor="middle">
        NO. ${stnNum} &bull; ${stationName}
      </text>

      <!-- Chassis Underframe -->
      <rect x="10" y="172" width="310" height="10" rx="2" fill="#181412"/>

      <!-- Carriage Bogie Wheels (2 pairs) -->
      <g class="train-wheels">
        <g transform="translate(60, 192)">
          <circle cx="0" cy="0" r="16" fill="#221b18" stroke="url(#brassGrad)" stroke-width="2.5"/>
          <line x1="-14" y1="0" x2="14" y2="0" stroke="#d4af37" stroke-width="1.5"/>
          <line x1="0" y1="-14" x2="0" y2="14" stroke="#d4af37" stroke-width="1.5"/>
          <circle cx="0" cy="0" r="5" fill="url(#brassGrad)"/>
        </g>
        <g transform="translate(100, 192)">
          <circle cx="0" cy="0" r="16" fill="#221b18" stroke="url(#brassGrad)" stroke-width="2.5"/>
          <line x1="-14" y1="0" x2="14" y2="0" stroke="#d4af37" stroke-width="1.5"/>
          <line x1="0" y1="-14" x2="0" y2="14" stroke="#d4af37" stroke-width="1.5"/>
          <circle cx="0" cy="0" r="5" fill="url(#brassGrad)"/>
        </g>
        <g transform="translate(230, 192)">
          <circle cx="0" cy="0" r="16" fill="#221b18" stroke="url(#brassGrad)" stroke-width="2.5"/>
          <line x1="-14" y1="0" x2="14" y2="0" stroke="#d4af37" stroke-width="1.5"/>
          <line x1="0" y1="-14" x2="0" y2="14" stroke="#d4af37" stroke-width="1.5"/>
          <circle cx="0" cy="0" r="5" fill="url(#brassGrad)"/>
        </g>
        <g transform="translate(270, 192)">
          <circle cx="0" cy="0" r="16" fill="#221b18" stroke="url(#brassGrad)" stroke-width="2.5"/>
          <line x1="-14" y1="0" x2="14" y2="0" stroke="#d4af37" stroke-width="1.5"/>
          <line x1="0" y1="-14" x2="0" y2="14" stroke="#d4af37" stroke-width="1.5"/>
          <circle cx="0" cy="0" r="5" fill="url(#brassGrad)"/>
        </g>
      </g>
    </g>
  `;
}
