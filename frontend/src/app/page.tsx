import { perfil } from "@/content/perfil";
import { botaoAcao, botaoWhatsapp } from "@/lib/estilos";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <div>
          <p className="font-script text-4xl text-acao">{perfil.funcao}</p>
          <h1 className="mt-2 font-display text-5xl tracking-[0.08em] sm:text-6xl">PAULO ROBERTO</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted">{perfil.resumo}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={perfil.whatsappLink} className={botaoWhatsapp}>
              Chamar no WhatsApp
            </a>
            <Link href="/login" className={botaoAcao}>
              Área do aluno
            </Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-sm">
          <div className="overflow-hidden rounded-md border border-linha bg-cartao shadow-[0_18px_50px_rgba(28,28,28,0.08)]">
            <div className="h-1 bg-acao" />
            <Image
              src="/paulo-roberto.jpg"
              alt="Paulo Roberto em pose de treino, no anúncio de personal trainer"
              width={720}
              height={1280}
              priority
              className="h-auto w-full object-cover object-[center_22%]"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-linha bg-cartao">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-3">
          {perfil.passos.map((passo, indice) => (
            <article key={passo.titulo}>
              <p className="font-display text-sm tracking-[0.18em] text-acao">0{indice + 1}</p>
              <h2 className="mt-2 font-display text-2xl uppercase tracking-wide">{passo.titulo}</h2>
              <p className="mt-3 leading-7 text-muted">{passo.texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl uppercase tracking-wide">Onde o treino acontece</h2>
          <p className="mt-3 leading-7 text-muted">{perfil.sobre}</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {perfil.condominios.map((condominio) => (
            <article key={condominio.nome} className="rounded-md border border-linha bg-cartao p-5">
              <h3 className="font-display text-xl uppercase tracking-wide">{condominio.nome}</h3>
              <p className="mt-2 leading-7 text-muted">{condominio.texto}</p>
            </article>
          ))}
        </div>
        <Link href="/atendimento" className="mt-6 inline-block text-acao">
          Ver atendimento e horários
        </Link>
      </section>
    </div>
  );
}
