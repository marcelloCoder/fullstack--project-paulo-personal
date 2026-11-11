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
  idade: number | null;
  profissao: string | null;
  alturaM: number | null;
  pesoKg: number | null;
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
  idade: number | null;
  profissao: string | null;
  alturaM: number | null;
  pesoKg: number | null;
  criadoEm: string;
};

export type Exercicio = {
  id: number;
  ordem: number;
  nome: string;
  series: number;
  repeticoes: number;
  cargaKg: number;
  descansoSegundos: number;
  observacao: string | null;
};

export type Treino = {
  id: number;
  nome: string;
  ordem: number;
  observacao: string | null;
  diasSemana: number[];
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
  repeticoes: number;
  cargaKg: number;
  descansoSegundos: number;
  observacao: string;
};

export type TreinoRascunho = {
  nome: string;
  observacao: string;
  diasSemana: number[];
  exercicios: ExercicioRascunho[];
};
