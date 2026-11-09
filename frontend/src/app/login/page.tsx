import { FormularioLogin } from "@/components/formulario-login";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Entrar" };

export default function Login() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-center font-display text-4xl uppercase tracking-wide">Entrar</h1>
      <p className="mt-3 text-center text-muted">Alunos entram para ver a ficha. O Paulo entra na área de administração.</p>
      <FormularioLogin />
    </div>
  );
}
