import { FormularioCadastro } from "@/components/formulario-cadastro";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cadastro" };

export default function Cadastro() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-center font-display text-4xl uppercase tracking-wide">Cadastro</h1>
      <p className="mt-3 text-center text-muted">Crie sua conta de aluno para acessar a ficha quando o Paulo publicar o treino.</p>
      <FormularioCadastro />
    </div>
  );
}
