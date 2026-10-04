/**
 * The Great Spell Registry
 * All 14 incantations, effects, keybindings, and acoustic triggers.
 */

export const spells = Object.freeze([
  {
    id: 'lumos',
    incantation: 'Lumos',
    label: 'Light Broadsheet',
    effect: 'theme-light',
    keys: ['l', 'L'],
    where: 'Global & Navbar',
    sfx: 'wand',
    description: 'Illuminates the page in traditional parchment daylight edition.'
  },
  {
    id: 'nox',
    incantation: 'Nox',
    label: 'Dark Ink Edition',
    effect: 'theme-dark',
    keys: ['n', 'N'],
    where: 'Global & Navbar',
    sfx: 'wand',
    description: 'Extinguishes the light, entering dark midnight ink mode.'
  },
  {
    id: 'revelio',
    incantation: 'Revelio',
    label: 'Reveal Secrets',
    effect: 'reveal-detail',
    keys: ['r', 'R'],
    where: 'Railway, Potion Cabinet, Cards',
    sfx: 'paper',
    description: 'Unveils hidden engineering disclosures, query indexes, and parameters.'
  },
  {
    id: 'accio',
    incantation: 'Accio Source',
    label: 'Summon Source',
    effect: 'open-github',
    keys: ['a', 'A'],
    where: 'Station Panel, Dossier',
    sfx: 'whistle',
    description: 'Summons the repository from the GitHub archives.'
  },
  {
    id: 'alohomora',
    incantation: 'Alohomora',
    label: 'Unlock Dossier',
    effect: 'open-modal',
    keys: ['o', 'O'],
    where: 'Cards, Station Panel',
    sfx: 'door',
    description: 'Unlocks the tamper-evident wax seal of the case dossier.'
  },
  {
    id: 'protego',
    incantation: 'Protego',
    label: 'Shield Navigation',
    effect: 'toggle-lock',
    keys: ['p', 'P'],
    where: 'Railway HUD',
    sfx: 'bell',
    description: 'Erects a protective barrier preventing accidental track navigation.'
  },
  {
    id: 'wingardium',
    incantation: 'Wingardium',
    label: 'Levitate Focus',
    effect: 'hover-lift',
    keys: ['w', 'W'],
    where: 'Cards, Potion Bottles',
    sfx: 'wand',
    description: 'Levitates cards and potion phials upon magical focus.'
  },
  {
    id: 'reparo',
    incantation: 'Reparo',
    label: 'Mend & Reset',
    effect: 'reset-filters',
    keys: ['g', 'G'],
    where: 'Case Files Header',
    sfx: 'paper',
    description: 'Mends fractured filter matrices and restores all dispatch articles.'
  },
  {
    id: 'obliviate',
    incantation: 'Obliviate',
    label: 'Erase Search',
    effect: 'clear-search',
    keys: ['Backspace'],
    where: 'Laboratory Search Bar',
    sfx: 'paper',
    description: 'Clears active forensics search query from memory.'
  },
  {
    id: 'priorIncantato',
    incantation: 'Prior Incantato',
    label: 'Previous Station',
    effect: 'prev-station',
    keys: ['ArrowLeft'],
    where: 'Railway HUD',
    sfx: 'chug',
    description: 'Echoes the previous station along the railway line.'
  },
  {
    id: 'expectoPatronum',
    incantation: 'Expecto Patronum',
    label: 'Conjure Patronus',
    effect: 'highlight-featured',
    keys: ['e', 'E'],
    where: 'Case Files Header & Spellbook',
    sfx: 'bell',
    description: 'Conjures a radiant silver-blue beacon guiding to the featured station.'
  },
  {
    id: 'portkey',
    incantation: 'Portkey',
    label: 'Transport to Live Demo',
    effect: 'open-demo',
    keys: [],
    where: 'Station Panel & Dossier',
    sfx: 'whistle',
    description: 'Enchants an external link to transport the explorer to a live demo.'
  },
  {
    id: 'finite',
    incantation: 'Finite Incantatem',
    label: 'Halt All Magic',
    effect: 'stop-effects',
    keys: ['Escape'],
    where: 'Global & Spellbook',
    sfx: 'bell',
    description: 'Terminates all running kinetic animations, loops, and effects.'
  },
  {
    id: 'morsmordre',
    incantation: 'Morsmordre',
    label: 'Dark Mark Prank',
    effect: 'dark-mark',
    keys: ['morsmordre'],
    where: 'Global Easter Egg',
    sfx: 'chime',
    description: 'Summons a fleeting, harmless green skull in the clouds. Hire him instead.'
  }
].map(s => Object.freeze({
  ...s,
  keys: Object.freeze([...s.keys])
})));

export function getSpellById(id) {
  return spells.find(s => s.id === id) || null;
}
