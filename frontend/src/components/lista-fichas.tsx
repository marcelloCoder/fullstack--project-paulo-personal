"use client";

import { ApiError, api } from "@/lib/api";
import { rotuloDiasSemana } from "@/lib/dias-semana";
import { botaoAcao, botaoSecundario } from "@/lib/estilos";
import { letraDaFicha, rotuloDivisaoTreino } from "@/lib/fichas";
import type { Ficha } from "@/lib/tipos";
import { useEffect, useRef, useState } from "react";

export function ListaFichas({
  fichas,
  aoNova,
  aoEditar,
  aoAtualizar,
}: {
  fichas: Ficha[];
  aoNova: () => void;
  aoEditar: (ficha: Ficha) => void;
  aoAtualizar: () => Promise<void>;
}) {
  return (
    <section className="overflow-visible rounded-2xl border border-linha bg-cartao p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-tinta text-cartao">
            <IconeHaltere className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-3xl uppercase tracking-wide">Fichas</h2>
            <p className="mt-1 text-sm text-muted">Visualize e gerencie as fichas de treino</p>
          </div>
        </div>
        <button type="button" className={botaoAcao} onClick={aoNova}>
          + Nova ficha
        </button>
      </div>

      {fichas.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-linha bg-fundo px-4 py-10 text-center text-muted">
          Nenhuma ficha ainda. Crie a primeira para ativar o aluno.
        </div>
      ) : (
        <ul className="mt-6 space-y-4 overflow-visible">
          {fichas.map((ficha, indice) => (
            <CardFicha
              key={ficha.id}
              ficha={ficha}
              letra={letraDaFicha(indice)}
              aoEditar={() => aoEditar(ficha)}
              aoAtualizar={aoAtualizar}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function CardFicha({
  ficha,
  letra,
  aoEditar,
  aoAtualizar,
}: {
  ficha: Ficha;
  letra: string;
  aoEditar: () => void;
  aoAtualizar: () => Promise<void>;
}) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [ativando, setAtivando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [erro, setErro] = useState("");
  const menu = useRef<HTMLDivElement>(null);
  const divisao = rotuloDivisaoTreino(ficha);

  useEffect(() => {
    if (!menuAberto) return;
    function fechar(evento: MouseEvent) {
      if (menu.current && !menu.current.contains(evento.target as Node)) {
        setMenuAberto(false);
      }
    }
    function fecharComEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") setMenuAberto(false);
    }
    document.addEventListener("mousedown", fechar);
    document.addEventListener("keydown", fecharComEscape);
    return () => {
      document.removeEventListener("mousedown", fechar);
      document.removeEventListener("keydown", fecharComEscape);
    };
  }, [menuAberto]);

  async function ativar() {
    setErro("");
    setAtivando(true);
    try {
      await api(`/api/admin/fichas/${ficha.id}/ativar`, { method: "PATCH" });
      setMenuAberto(false);
      await aoAtualizar();
    } catch (falha) {
      setErro(falha instanceof ApiError ? falha.message : "Não foi possível ativar a ficha.");
    } finally {
      setAtivando(false);
    }
  }

  async function excluir() {
    setErro("");
    setExcluindo(true);
    try {
      await api(`/api/admin/fichas/${ficha.id}`, { method: "DELETE" });
      setConfirmandoExclusao(false);
      setMenuAberto(false);
      await aoAtualizar();
    } catch (falha) {
      setErro(falha instanceof ApiError ? falha.message : "Não foi possível excluir a ficha.");
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <li
      className={`relative rounded-2xl border border-linha bg-white shadow-[0_8px_24px_rgba(28,28,28,0.06)] ${
        menuAberto ? "z-30" : "z-0"
      } ${ficha.ativa ? "border-l-4 border-l-ativo" : "border-l-4 border-l-acao"}`}
    >
      <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between lg:gap-5 lg:px-5 lg:py-4">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
          <div
            className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl ${
              ficha.ativa ? "bg-ativo text-white" : "bg-acao text-white"
            }`}
          >
            <span className="font-display text-2xl leading-none">{letra}</span>
            <IconeHaltere className="mt-1 h-4 w-4 opacity-90" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-display text-xl uppercase tracking-wide text-tinta">{ficha.titulo}</h3>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-linha bg-fundo px-2.5 py-1 text-xs text-muted">
              <IconeCalendario className="h-3.5 w-3.5" />
              <span>{ficha.inicio}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-linha bg-fundo px-3 py-1.5 text-sm text-tinta">
            <IconeCiclo className="h-4 w-4 text-acao" />
            <span className="font-medium">{divisao}</span>
          </div>
          {[...(ficha.treinos ?? [])]
            .sort((a, b) => a.ordem - b.ordem)
            .some((treino) => (treino.diasSemana?.length ?? 0) > 0) && (
            <p className="w-full text-xs text-muted lg:w-auto">
              {[...(ficha.treinos ?? [])]
                .sort((a, b) => a.ordem - b.ordem)
                .filter((treino) => (treino.diasSemana?.length ?? 0) > 0)
                .map((treino, indice) => `${String.fromCharCode(65 + indice)}: ${rotuloDiasSemana(treino.diasSemana)}`)
                .join(" · ")}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {ficha.ativa ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ativo/10 px-3 py-1.5 text-sm font-medium text-ativo">
              <IconeCheck className="h-4 w-4" />
              Ativa
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-acao/10 px-3 py-1.5 text-sm font-medium text-acao">
              Inativa
            </span>
          )}
          <button type="button" className={botaoSecundario} onClick={aoEditar}>
            <span className="inline-flex items-center gap-2">
              <IconeLapis className="h-4 w-4" />
              Editar
            </span>
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-acao/30 bg-acao/10 px-4 py-2 text-sm text-acao transition hover:bg-acao hover:text-white disabled:opacity-60"
            disabled={excluindo}
            onClick={() => setConfirmandoExclusao(true)}
          >
            Remover
          </button>
          <div className="relative" ref={menu}>
            <button
              type="button"
              aria-label="Mais opções da ficha"
              aria-expanded={menuAberto}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-tinta/15 bg-cartao text-tinta transition hover:border-acao hover:text-acao"
              onClick={() => setMenuAberto((aberto) => !aberto)}
            >
              <IconeMenu className="h-4 w-4" />
            </button>
            {menuAberto && (
              <div className="absolute right-0 bottom-full z-40 mb-2 w-44 rounded-md border border-linha bg-cartao py-1 shadow-lg">
                <button
                  type="button"
                  disabled={ativando || ficha.ativa}
                  className="block w-full px-3 py-2.5 text-left text-sm hover:bg-fundo disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => void ativar()}
                >
                  {ficha.ativa ? "Já está ativa" : ativando ? "Ativando..." : "Tornar ativa"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {confirmandoExclusao && (
        <div className="border-t border-linha bg-fundo/70 px-4 py-3">
          <p className="text-sm text-tinta">
            Remover a ficha <span className="font-medium">{ficha.titulo}</span>? Os treinos e exercícios dela serão
            apagados.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={excluindo}
              className="inline-flex items-center justify-center rounded-md bg-acao px-4 py-2 text-sm text-white transition hover:bg-acao-hover disabled:opacity-60"
              onClick={() => void excluir()}
            >
              {excluindo ? "Removendo..." : "Confirmar remoção"}
            </button>
            <button
              type="button"
              disabled={excluindo}
              className={botaoSecundario}
              onClick={() => setConfirmandoExclusao(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {erro && <p className="border-t border-linha px-4 py-2 text-sm text-acao">{erro}</p>}
    </li>
  );
}

function IconeHaltere({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M6 9v6M8 7v10M16 7v10M18 9v6M8 12h8" strokeLinecap="round" />
    </svg>
  );
}

function IconeCalendario({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M8 3.5v3M16 3.5v3M3.5 10h17" strokeLinecap="round" />
    </svg>
  );
}

function IconeCiclo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M4 12a8 8 0 0 1 13.5-5.8M20 12a8 8 0 0 1-13.5 5.8" strokeLinecap="round" />
      <path d="M17 3v4h4M7 21v-4H3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconeCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M5 12.5 9.5 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconeLapis({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="m4 16.5 9.8-9.8 3.5 3.5L7.5 20H4v-3.5Z" strokeLinejoin="round" />
      <path d="m12.5 5.2 3.5 3.5" strokeLinecap="round" />
    </svg>
  );
}

function IconeMenu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  );
}
