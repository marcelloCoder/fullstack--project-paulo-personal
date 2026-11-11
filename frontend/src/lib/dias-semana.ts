export const DIAS_SEMANA = [
  { valor: 0, curto: "Dom", nome: "Domingo" },
  { valor: 1, curto: "Seg", nome: "Segunda-feira" },
  { valor: 2, curto: "Ter", nome: "Terça-feira" },
  { valor: 3, curto: "Qua", nome: "Quarta-feira" },
  { valor: 4, curto: "Qui", nome: "Quinta-feira" },
  { valor: 5, curto: "Sex", nome: "Sexta-feira" },
  { valor: 6, curto: "Sáb", nome: "Sábado" },
] as const;

export type DiaSemana = (typeof DIAS_SEMANA)[number]["valor"];

export function rotuloDiasSemana(dias: number[] | null | undefined) {
  if (!dias || dias.length === 0) return "Sem dias definidos";
  const ordenados = [...dias].sort((a, b) => a - b);
  return ordenados
    .map((dia) => DIAS_SEMANA.find((item) => item.valor === dia)?.curto ?? String(dia))
    .join(" · ");
}

export function nomeDiaSemana(dia: number) {
  return DIAS_SEMANA.find((item) => item.valor === dia)?.nome ?? "Dia inválido";
}
