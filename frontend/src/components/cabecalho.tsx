"use client";

import { useAuth } from "@/components/provedor-auth";
import Link from "next/link";

export function Cabecalho() {
  const { usuario, pronto, sair } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-linha bg-cartao/95 backdrop-blur">
      <div className="h-1 bg-acao" />
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="leading-none">
          <span className="block font-display text-xl tracking-[0.18em]">PAULO ROBERTO</span>
          <span className="block font-script text-2xl leading-none text-acao">Personal Trainer</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <Link href="/" className="hover:text-acao">
            Início
          </Link>
          <Link href="/atendimento" className="hover:text-acao">
            Atendimento
          </Link>
          {pronto && usuario?.papel === "ADMIN" && (
            <Link href="/admin" className="hover:text-acao">
              Alunos
            </Link>
          )}
          {pronto && usuario?.papel === "ALUNO" && (
            <Link href="/app" className="hover:text-acao">
              Minha ficha
            </Link>
          )}
          {pronto && usuario && (
            <Link href="/perfil" className="hover:text-acao">
              Meu perfil
            </Link>
          )}
          {pronto && usuario ? (
            <button type="button" onClick={() => void sair()} className="hover:text-acao">
              Sair
            </button>
          ) : (
            <Link href="/login" className="font-display uppercase tracking-[0.12em] text-acao">
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
