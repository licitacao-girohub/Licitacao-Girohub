export const NUMS_COM_MODELO: number[];
export function gerarModelo(num: number): Promise<{ nome: string; pasta: string; buffer: Buffer; titulo: string } | null>;
