/**
 * Case Dossier Modal (Alias / Facade pointing to dossier.js)
 */

export { 
  initDossier as initModal, 
  destroyDossier as destroyModal, 
  openDossier as openCaseModal, 
  closeDossier as closeCaseModal 
} from './dossier.js';
