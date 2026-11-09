import { ExigePapel } from "@/components/exige-papel";
import { MinhaFicha } from "@/components/minha-ficha";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Minha ficha" };

export default function PaginaDaFicha() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <ExigePapel papel="ALUNO">
        <MinhaFicha />
      </ExigePapel>
    </div>
  );
}
