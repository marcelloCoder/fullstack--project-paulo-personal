import { MeuPerfil } from "@/components/meu-perfil";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Meu perfil" };

export default function Perfil() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <MeuPerfil />
    </div>
  );
}
