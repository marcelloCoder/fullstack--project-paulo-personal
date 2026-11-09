import { ExigePapel } from "@/components/exige-papel";
import { ListaAlunos } from "@/components/painel-admin";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Alunos" };

export default function Admin() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <ExigePapel papel="ADMIN">
        <ListaAlunos />
      </ExigePapel>
    </div>
  );
}
