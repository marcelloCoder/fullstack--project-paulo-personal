export type Papel = "ADMIN" | "ALUNO";

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  papel: Papel;
  objetivo: string | null;
  observacao: string | null;
  ativo: boolean;
  criadoEm: string | null;
};

export type Aluno = {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  ativo: boolean;
  objetivo: string | null;
  observacao: string | null;
  criadoEm: string;
};

export type Exercicio = {
  id: number;
  ordem: number;
  nome: string;
  series: number;
  repeticoes: string;
  carga: string | null;
  descanso: string | null;
};

export type Treino = {
  id: number;
  nome: string;
  ordem: number;
  observacao: string | null;
  exercicios: Exercicio[];
};

export type Ficha = {
  id: number;
  alunoId: number;
  titulo: string;
  objetivo: string | null;
  observacao: string | null;
  inicio: string;
  ativa: boolean;
  treinos: Treino[];
};

export type ExercicioRascunho = {
  nome: string;
  series: number;
  repeticoes: string;
  carga: string;
  descanso: string;
};

export type TreinoRascunho = {
  nome: string;
  observacao: string;
  exercicios: ExercicioRascunho[];
};
