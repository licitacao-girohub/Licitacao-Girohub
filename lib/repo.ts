import 'server-only';
import type { Arquivos, Repo } from './tipos-repo';
import { sheetsRepo } from './google/sheets-repo';
import { driveArquivos } from './google/drive';
import { demoRepo, demoArquivos } from './demo/demo';

export const modoDemo = () => process.env.DATA_MODE === 'demo';

export function repo(): Repo { return modoDemo() ? demoRepo : sheetsRepo; }
export function arquivos(): Arquivos { return modoDemo() ? demoArquivos : driveArquivos; }

/** Raiz das pastas: biblioteca permanente do checklist mestre e pasta do certame piloto. */
export const BIBLIOTECA = 'Biblioteca_Checklist_Mestre';
export const CERTAME_PILOTO = ['Certames', 'CRMV-ES_DE-51-2026'];
