"use client";

import { perfil } from "@/content/perfil";
import { ApiError, api } from "@/lib/api";
import { rotuloDiasSemana } from "@/lib/dias-semana";
import { botaoWhatsapp } from "@/lib/estilos";
import { grupoMuscularDoExercicio, rotuloTreino, type GrupoMuscular } from "@/lib/fichas";
import type { Exercicio, Ficha, Treino } from "@/lib/tipos";
import { useEffect, useState, type ReactNode } from "react";

const coresAba = [
  { anel: "bg-acao text-white", fundo: "bg-acao/10 text-acao" },
  { anel: "bg-tinta text-cartao", fundo: "bg-tinta/10 text-tinta" },
  { anel: "bg-ativo text-white", fundo: "bg-ativo/10 text-ativo" },
  { anel: "bg-muted text-cartao", fundo: "bg-muted/15 text-muted" },
];

export function MinhaFicha() {
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [vazia, setVazia] = useState(false);
  const [erro, setErro] = useState("");
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    api<Ficha>("/api/me/ficha")
      .then((dados) => {
        setFicha(dados);
        setVazia(false);
      })
      .catch((falha) => {
        if (falha instanceof ApiError && falha.status === 404) {
          setVazia(true);
          return;
        }
        setErro(falha instanceof ApiError ? falha.message : "Não foi possível carregar a ficha.");
      });
  }, []);

  if (erro) {
    return <p className="text-acao">{erro}</p>;
  }
  if (vazia) {
    return (
      <div className="max-w-xl rounded-2xl border border-linha bg-cartao p-6 shadow-[0_12px_40px_rgba(28,28,28,0.06)]">
        <h1 className="font-display text-3xl uppercase tracking-wide">Minha ficha</h1>
        <p className="mt-3 leading-7 text-muted">Você ainda não tem uma ficha ativa. Fale com o Paulo.</p>
        <a href={perfil.whatsappLink} className={`${botaoWhatsapp} mt-6`}>
          Chamar no WhatsApp
        </a>
      </div>
    );
  }
  if (!ficha) {
    return <p className="text-muted">Carregando ficha...</p>;
  }

  const treinos = [...ficha.treinos].sort((a, b) => a.ordem - b.ordem);
  const treino = treinos[indice] ?? treinos[0];
  const rotulo = treino ? rotuloTreino(treino, indice) : null;

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-8 h-56 bg-[radial-gradient(ellipse_at_top_right,_rgba(200,16,46,0.10),_transparent_55%),radial-gradient(ellipse_at_top_left,_rgba(27,127,78,0.08),_transparent_50%)]"
      />

      <header className="relative">
        <p className="text-sm uppercase tracking-[0.16em] text-acao">Ficha ativa</p>
        <h1 className="mt-1 font-display text-4xl uppercase tracking-wide text-tinta sm:text-5xl">{ficha.titulo}</h1>
        {ficha.objetivo && <p className="mt-2 text-lg text-muted">{ficha.objetivo}</p>}
        {ficha.observacao && <p className="mt-3 max-w-3xl leading-7 text-muted">{ficha.observacao}</p>}
      </header>

      {treinos.length === 0 ? (
        <p className="relative mt-8 text-muted">Esta ficha ainda não tem treinos.</p>
      ) : (
        <div className="relative mt-8">
          <nav aria-label="Treinos da ficha" className="overflow-x-auto pb-1">
            <div className="flex min-w-max gap-3">
              {treinos.map((item, posicao) => (
                <AbaTreino
                  key={item.id}
                  treino={item}
                  indice={posicao}
                  ativo={posicao === indice}
                  onClick={() => setIndice(posicao)}
                />
              ))}
            </div>
          </nav>

          {treino && rotulo && (
            <section className="mt-6">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl uppercase tracking-wide text-tinta sm:text-3xl">
                    {rotulo.titulo}
                    {rotulo.subtitulo ? ` — ${rotulo.subtitulo}` : ""}
                  </h2>
                  <p className="mt-1 text-sm text-muted">{rotuloDiasSemana(treino.diasSemana)}</p>
                </div>
                <span className="rounded-full border border-linha bg-cartao px-3 py-1 text-xs uppercase tracking-wider text-muted">
                  {treino.exercicios.length} exercício{treino.exercicios.length === 1 ? "" : "s"}
                </span>
              </div>

              {treino.observacao && (
                <p className="mb-5 max-w-3xl rounded-xl border border-linha bg-cartao/80 px-4 py-3 text-sm leading-7 text-muted">
                  {treino.observacao}
                </p>
              )}

              <div className="grid gap-4">
                {treino.exercicios.map((exercicio, indiceExercicio) => (
                  <CardExercicio
                    key={exercicio.id}
                    exercicio={exercicio}
                    letra={String.fromCharCode(65 + (indiceExercicio % 26))}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function AbaTreino({
  treino,
  indice,
  ativo,
  onClick,
}: {
  treino: Treino;
  indice: number;
  ativo: boolean;
  onClick: () => void;
}) {
  const rotulo = rotuloTreino(treino, indice);
  const cor = coresAba[indice % coresAba.length];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={`relative flex min-w-[11.5rem] items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition ${
        ativo
          ? "bg-acao text-white shadow-[0_10px_28px_rgba(200,16,46,0.28)]"
          : "border border-linha bg-cartao text-tinta hover:border-acao/40"
      }`}
    >
      <span
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-base ${
          ativo ? "bg-white/20 text-white" : cor.anel
        }`}
      >
        {rotulo.letra}
      </span>
      <span className="min-w-0">
        <span className={`block truncate text-sm font-semibold ${ativo ? "text-white" : "text-tinta"}`}>
          {rotulo.titulo}
        </span>
        <span className={`mt-0.5 block truncate text-xs ${ativo ? "text-white/80" : "text-muted"}`}>
          {rotulo.subtitulo || rotuloDiasSemana(treino.diasSemana)}
        </span>
      </span>
      {ativo && <span className="absolute inset-x-6 -bottom-px h-0.5 rounded-full bg-acao" aria-hidden="true" />}
    </button>
  );
}

function CardExercicio({ exercicio, letra }: { exercicio: Exercicio; letra: string }) {
  const grupo = grupoMuscularDoExercicio(exercicio.nome);

  return (
    <article className="overflow-hidden rounded-2xl border border-linha border-l-4 border-l-acao bg-white shadow-[0_10px_30px_rgba(28,28,28,0.06)]">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-acao/10 text-acao sm:h-24 sm:w-24">
          <IconeEquipamento grupo={grupo} className="h-10 w-10 sm:h-12 sm:w-12" />
        </div>

        <div className="min-w-0 flex-1">
          <span className="inline-flex rounded-md bg-acao/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-acao">
            Série {letra}
          </span>
          <h3 className="mt-2 font-display text-xl uppercase tracking-wide text-tinta sm:text-2xl">{exercicio.nome}</h3>
          <p className="mt-1 text-sm text-muted">
            {exercicio.observacao?.trim() ? exercicio.observacao : descricaoGrupo(grupo)}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metrica icone={<IconeSeries className="h-4 w-4" />} rotulo="Séries" valor={String(exercicio.series)} />
            <Metrica
              icone={<IconeReps className="h-4 w-4" />}
              rotulo="Repetições"
              valor={String(exercicio.repeticoes)}
            />
            <Metrica
              icone={<IconeCarga className="h-4 w-4" />}
              rotulo="Carga"
              valor={`${formatarCargaKg(exercicio.cargaKg)} kg`}
            />
            <Metrica
              icone={<IconeDescanso className="h-4 w-4" />}
              rotulo="Descanso"
              valor={`${exercicio.descansoSegundos} s`}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function Metrica({ icone, rotulo, valor }: { icone: ReactNode; rotulo: string; valor: string }) {
  return (
    <div className="rounded-xl border border-linha bg-fundo/70 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-acao">
        {icone}
        <span className="text-[11px] uppercase tracking-wider text-muted">{rotulo}</span>
      </div>
      <p className="mt-1 font-display text-lg uppercase tracking-wide text-tinta">{valor}</p>
    </div>
  );
}

function formatarCargaKg(valor: number) {
  if (!Number.isFinite(valor)) return "0";
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(1).replace(".", ",");
}

function descricaoGrupo(grupo: GrupoMuscular) {
  switch (grupo) {
    case "peito":
      return "Foco em peitoral, com apoio de ombros e tríceps.";
    case "costas":
      return "Foco em dorsal e estabilizadores da postura.";
    case "ombros":
      return "Foco em deltoides e estabilidade do ombro.";
    case "bracos":
      return "Foco em bíceps e tríceps.";
    case "pernas":
      return "Foco em quadríceps, posterior e glúteos.";
    case "core":
      return "Foco em core e estabilização do tronco.";
    default:
      return "Execute com controle e amplitude completa.";
  }
}

function IconeEquipamento({ grupo, className }: { grupo: GrupoMuscular; className?: string }) {
  if (grupo === "pernas") {
    return (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
        <path d="M14 10h20v6H14zM18 16v18M30 16v18M12 34h24" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="18" cy="38" r="3" />
        <circle cx="30" cy="38" r="3" />
      </svg>
    );
  }
  if (grupo === "costas") {
    return (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
        <path d="M10 18h28M14 18v14M34 18v14M18 32h12" strokeLinecap="round" />
        <path d="M24 10v8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M8 20v8M12 16v16M36 16v16M40 20v8M12 24h24" strokeLinecap="round" />
    </svg>
  );
}

function IconeSeries({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M5 7h14M5 12h14M5 17h10" strokeLinecap="round" />
    </svg>
  );
}

function IconeReps({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M4 12a8 8 0 0 1 13.5-5.8M20 12a8 8 0 0 1-13.5 5.8" strokeLinecap="round" />
      <path d="M17 3v4h4M7 21v-4H3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconeCarga({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M6 9v6M8 7v10M16 7v10M18 9v6M8 12h8" strokeLinecap="round" />
    </svg>
  );
}

function IconeDescanso({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
