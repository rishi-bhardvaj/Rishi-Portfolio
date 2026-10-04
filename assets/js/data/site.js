/**
 * Site Metadata & Broadsheet Typography Nomenclature
 * Standardized on "Daily Chronicle" terminology.
 */

export const siteMeta = Object.freeze({
  name: 'Rishi Bhardvaj',
  title: 'Daily Chronicle • The Broadsheet Edition',
  masthead: 'DAILY CHRONICLE',
  subBanner: '★ THE RECORD OF A SOFTWARE ENGINEER • ENTERPRISE SYSTEMS ★',
  volume: 'VOL. XXIV • NO. 85248',
  price: 'PRICE: 7 SICKLES',
  deskLocation: 'Bangalore, India',
  
  terminology: Object.freeze({
    work: 'CASE FILES',
    workSub: 'Selected Dispatches & Railway Stations',
    skills: 'THE LABORATORY',
    skillsSub: 'Substances, Potions & Forensics',
    ledger: 'CAREER LEDGER',
    ledgerSub: 'Movements on Record Since 2021',
    contact: 'OWL POST',
    contactSub: 'Letters, Commissions & Telegraph Line',
    archives: 'PROJECT ARCHIVES'
  }),

  mastheadEars: Object.freeze([
    {
      id: 'reward',
      title: '100,000 GALLONS // REWARD',
      highlight: true,
      text: '79 Mission-Critical defects resolved on Finacle Enterprise Core Banking.'
    },
    {
      id: 'weather',
      title: 'NATIONAL WEATHER',
      highlight: false,
      temp: '24°C High Concurrency',
      concurrency: 'Operational 99.99%'
    },
    {
      id: 'zodiac',
      title: 'ZODIAC • ASPECTS',
      highlight: false,
      text: 'Java 17 & Spring Boot 3 in Apex. PostgreSQL in Ascendance. Zero-Trust RBAC sealed.'
    },
    {
      id: 'edition',
      title: 'FIRST-SECOND EDITION',
      highlight: false,
      text: 'Special Investigation • Lead Architect Observed at EdgeVerve (Infosys).'
    }
  ])
});
