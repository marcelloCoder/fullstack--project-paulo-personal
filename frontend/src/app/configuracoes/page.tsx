import { FormularioConfiguracoes } from "@/components/formulario-configuracoes";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Configurações" };

export default function Configuracoes() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <FormularioConfiguracoes />
    </div>
  );
}
