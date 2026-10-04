/**
 * Navigation Registry
 * Consumed by vintage navbar, mobile drawer, scroll-spy, and Marauder's Map.
 */

export const navSections = Object.freeze([
  {
    id: 'home',
    label: 'DISPATCH',
    fullName: 'Front Page & Overview',
    sub: 'The Broadside Front Page',
    mapPos: { x: 50, y: 15 },
    icon: 'feather'
  },
  {
    id: 'work',
    label: 'RAILWAY',
    fullName: 'The Wizarding Railway',
    sub: 'Case Files & Stations',
    mapPos: { x: 26, y: 38 },
    icon: 'train'
  },
  {
    id: 'stack',
    label: 'LABORATORY',
    fullName: 'The Lab Report & Potions',
    sub: 'Substance Cabinet & Forensics',
    mapPos: { x: 74, y: 48 },
    icon: 'flask'
  },
  {
    id: 'ledger',
    label: 'LEDGER',
    fullName: 'The Career Ledger',
    sub: 'Movements on Record',
    mapPos: { x: 28, y: 72 },
    icon: 'scroll'
  },
  {
    id: 'contact',
    label: 'OWL POST',
    fullName: 'Submit an Owl',
    sub: 'Letters, Commissions & Wire',
    mapPos: { x: 72, y: 84 },
    icon: 'feather-alt'
  }
]);
