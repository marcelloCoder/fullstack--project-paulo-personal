export type SlotAgenda = {
  diaSemana: number;
  horario: string;
  disponivel: boolean;
};

export const DIAS_UTEIS_AGENDA = [
  { valor: 1, rotulo: "Segunda", titulo: "segunda-feira" },
  { valor: 2, rotulo: "Terça", titulo: "terça-feira" },
  { valor: 3, rotulo: "Quarta", titulo: "quarta-feira" },
  { valor: 4, rotulo: "Quinta", titulo: "quinta-feira" },
  { valor: 5, rotulo: "Sexta", titulo: "sexta-feira" },
] as const;

export const HORARIOS_GRADE: string[] = Array.from({ length: 31 }, (_, indice) => {
  const totalMinutos = 6 * 60 + indice * 30;
  const hora = Math.floor(totalMinutos / 60);
  const minuto = totalMinutos % 60;
  return `${String(hora).padStart(2, "0")}:${String(minuto).padStart(2, "0")}`;
});

export function normalizarHorario(valor: string) {
  const [hora = "00", minuto = "00"] = valor.split(":");
  return `${hora.padStart(2, "0")}:${minuto.padStart(2, "0")}`;
}

export function periodoDoHorario(horario: string): "manha" | "tarde" | "noite" {
  const [horaTexto] = normalizarHorario(horario).split(":");
  const hora = Number(horaTexto);
  if (hora < 12) return "manha";
  if (hora < 18) return "tarde";
  return "noite";
}

export function rotuloPeriodo(periodo: "manha" | "tarde" | "noite") {
  if (periodo === "manha") return "Manhã";
  if (periodo === "tarde") return "Tarde";
  return "Noite";
}

export function tituloDiaAgenda(diaSemana: number) {
  return DIAS_UTEIS_AGENDA.find((dia) => dia.valor === diaSemana)?.titulo ?? "o dia selecionado";
}
