import { perfil } from "@/content/perfil";
import { botaoWhatsapp } from "@/lib/estilos";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atendimento",
  description: "Atendimento de personal trainer nos condomínios Sublime, Origem e Seleto.",
};

export default function Atendimento() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="font-script text-4xl text-acao">{perfil.funcao}</p>
      <h1 className="mt-2 font-display text-4xl uppercase tracking-wide sm:text-5xl">Atendimento</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{perfil.sobre}</p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {perfil.condominios.map((condominio) => (
          <article key={condominio.nome} className="rounded-md border border-linha bg-cartao p-6">
            <div className="mb-4 h-1 w-12 bg-acao" />
            <h2 className="font-display text-2xl uppercase tracking-wide">{condominio.nome}</h2>
            <p className="mt-3 leading-7 text-muted">{condominio.texto}</p>
          </article>
        ))}
      </div>

      <section className="mt-12 max-w-2xl rounded-md border border-linha bg-cartao p-6">
        <h2 className="font-display text-2xl uppercase tracking-wide">Horários</h2>
        <p className="mt-3 leading-7 text-muted">{perfil.horarios}</p>
        <a href={perfil.whatsappLink} className={`${botaoWhatsapp} mt-6`}>
          Consultar horários no WhatsApp
        </a>
        <p className="mt-4 text-sm text-muted">{perfil.whatsappExibicao}</p>
      </section>
    </div>
  );
}
