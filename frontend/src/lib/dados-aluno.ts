import type { Aluno, Usuario } from "@/lib/tipos";

export type DadosAluno = Pick<
  Aluno,
  "telefone" | "idade" | "profissao" | "alturaM" | "pesoKg" | "objetivo"
>;

function textoVazio(valor: string | null | undefined) {
  return valor == null || valor.trim() === "";
}

export function camposPendentesDoAluno(dados: DadosAluno) {
  return {
    telefone: textoVazio(dados.telefone),
    idade: dados.idade == null,
    profissao: textoVazio(dados.profissao),
    alturaM: dados.alturaM == null,
    pesoKg: dados.pesoKg == null,
    objetivo: textoVazio(dados.objetivo),
  };
}

export function temDadosPendentes(dados: DadosAluno | Usuario) {
  return Object.values(camposPendentesDoAluno(dados)).some(Boolean);
}
