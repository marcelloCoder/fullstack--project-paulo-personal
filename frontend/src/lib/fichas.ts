import type { Ficha, Treino } from "@/lib/tipos";

export function letrasDosTreinos(treinos: Treino[]) {
  return [...treinos]
    .sort((primeiro, segundo) => primeiro.ordem - segundo.ordem)
    .map((_, indice) => String.fromCharCode(65 + indice));
}

export function rotuloDivisaoTreino(ficha: Ficha) {
  const letras = letrasDosTreinos(ficha.treinos ?? []);
  if (letras.length === 0) return "Sem treinos";
  if (letras.length === 1) return `Treino ${letras[0]}`;
  return `Treino ${letras.join("-")}`;
}

export function letraDaFicha(indice: number) {
  return String.fromCharCode(65 + (indice % 26));
}

export function rotuloTreino(treino: Treino, indice: number) {
  const letra = String.fromCharCode(65 + (indice % 26));
  const nome = treino.nome.trim();
  const partes = nome.split(/\s+[—–-]\s+/);
  if (partes.length >= 2) {
    return {
      letra,
      titulo: partes[0].trim() || `Treino ${letra}`,
      subtitulo: partes.slice(1).join(" — ").trim(),
    };
  }
  if (/^treino\s+[a-z]$/i.test(nome)) {
    return { letra, titulo: nome, subtitulo: "" };
  }
  return { letra, titulo: `Treino ${letra}`, subtitulo: nome };
}

export type GrupoMuscular = "peito" | "costas" | "ombros" | "bracos" | "pernas" | "core" | "geral";

export function grupoMuscularDoExercicio(nome: string): GrupoMuscular {
  const texto = nome.toLowerCase();
  if (/supino|crucifixo|crossover|peito|peitoral|fly/.test(texto)) return "peito";
  if (/puxada|remada|barra fixa|pulldown|pullover|costas|dorsal/.test(texto)) return "costas";
  if (/desenvolvimento|elevação lateral|elevacao lateral|arnold|ombro|deltoide|face pull/.test(texto)) return "ombros";
  if (/rosca|tríceps|triceps|bíceps|biceps|braço|braco/.test(texto)) return "bracos";
  if (/agachamento|leg|afundo|extensora|flexora|panturrilha|stiff|terra|glúteo|gluteo|pélvica|pelvica|perna|coxa/.test(texto)) {
    return "pernas";
  }
  if (/prancha|abdominal|infra|crunch|core/.test(texto)) return "core";
  return "geral";
}
