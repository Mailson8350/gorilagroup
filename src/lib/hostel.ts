/** Imposto de turismo (XOF por pessoa, por reserva). */
export const TURISMO_TAXA_POR_PESSOA = 1000;

export function countNights(dataInicio: string, dataFim: string): number {
  if (!dataInicio || !dataFim || dataFim <= dataInicio) return 0;
  const start = new Date(`${dataInicio}T12:00:00`);
  const end = new Date(`${dataFim}T12:00:00`);
  return Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

export function calcTourismTax(numPessoas: number): number {
  return TURISMO_TAXA_POR_PESSOA * Math.max(1, numPessoas);
}
