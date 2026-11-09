"use client";

import { ApiError, api } from "@/lib/api";
import { botaoAcao, botaoSecundario, campo } from "@/lib/estilos";
import type { ExercicioRascunho, Ficha, TreinoRascunho } from "@/lib/tipos";
import { useState } from "react";

function exercicioVazio(): ExercicioRascunho {
  return { nome: "", series: 3, repeticoes: "", carga: "", descanso: "" };
}

function mover<T>(lista: T[], indice: number, delta: number) {
  const destino = indice + delta;
  if (destino < 0 || destino >= lista.length) return lista;
  const copia = [...lista];
  const [item] = copia.splice(indice, 1);
  copia.splice(destino, 0, item);
  return copia;
}

export function EditorFicha({
  alunoId,
  ficha,
  onSalva,
  onCancelar,
}: {
  alunoId: number;
  ficha: Ficha | null;
  onSalva: () => Promise<void>;
  onCancelar: () => void;
}) {
  const [titulo, setTitulo] = useState(ficha?.titulo ?? "");
  const [objetivo, setObjetivo] = useState(ficha?.objetivo ?? "");
  const [observacao, setObservacao] = useState(ficha?.observacao ?? "");
  const [inicio, setInicio] = useState(ficha?.inicio ?? new Date().toISOString().slice(0, 10));
  const [treinos, setTreinos] = useState<TreinoRascunho[]>(
    ficha?.treinos.map((treino) => ({
      nome: treino.nome,
      observacao: treino.observacao ?? "",
      exercicios: treino.exercicios.map((exercicio) => ({
        nome: exercicio.nome,
        series: exercicio.series,
        repeticoes: exercicio.repeticoes,
        carga: exercicio.carga ?? "",
        descanso: exercicio.descanso ?? "",
      })),
    })) ?? [{ nome: "Treino A", observacao: "", exercicios: [exercicioVazio()] }],
  );
  const [erro, setErro] = useState("");
  const [erros, setErros] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);

  function atualizarTreino(indice: number, treino: TreinoRascunho) {
    setTreinos((atual) => atual.map((item, posicao) => (posicao === indice ? treino : item)));
  }

  async function salvar() {
    setErro("");
    setErros([]);
    setSalvando(true);
    const corpo = { titulo, objetivo, observacao, inicio, treinos };
    try {
      if (ficha) {
        await api(`/api/admin/fichas/${ficha.id}`, { method: "PUT", body: JSON.stringify(corpo) });
      } else {
        await api(`/api/admin/alunos/${alunoId}/fichas`, { method: "POST", body: JSON.stringify(corpo) });
      }
      await onSalva();
    } catch (falha) {
      if (falha instanceof ApiError) {
        setErro(falha.message);
        setErros(falha.erros);
      } else {
        setErro("Não foi possível salvar a ficha.");
      }
    } finally {
      setSalvando(false);
    }
  }

  async function ativar() {
    if (!ficha) return;
    setErro("");
    setSalvando(true);
    try {
      await api(`/api/admin/fichas/${ficha.id}/ativar`, { method: "PATCH" });
      await onSalva();
    } catch (falha) {
      setErro(falha instanceof ApiError ? falha.message : "Não foi possível ativar a ficha.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="rounded-md border border-linha bg-cartao p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl uppercase tracking-wide">{ficha ? "Editar ficha" : "Nova ficha"}</h2>
        {ficha?.ativa && <span className="text-sm uppercase tracking-wider text-acao">Ativa</span>}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          Título
          <input value={titulo} onChange={(evento) => setTitulo(evento.target.value)} className={`${campo} mt-1`} />
        </label>
        <label className="block text-sm">
          Início
          <input type="date" value={inicio} onChange={(evento) => setInicio(evento.target.value)} className={`${campo} mt-1`} />
        </label>
        <label className="block text-sm sm:col-span-2">
          Objetivo
          <input value={objetivo} onChange={(evento) => setObjetivo(evento.target.value)} className={`${campo} mt-1`} />
        </label>
        <label className="block text-sm sm:col-span-2">
          Observação
          <textarea value={observacao} onChange={(evento) => setObservacao(evento.target.value)} className={`${campo} mt-1`} rows={2} />
        </label>
      </div>

      <div className="mt-6 space-y-4">
        {treinos.map((treino, indiceTreino) => (
          <article key={indiceTreino} className="rounded-md border border-linha bg-fundo p-4">
            <div className="flex flex-wrap items-end gap-2">
              <label className="block min-w-40 flex-1 text-sm">
                Treino
                <input
                  value={treino.nome}
                  onChange={(evento) => atualizarTreino(indiceTreino, { ...treino, nome: evento.target.value })}
                  className={`${campo} mt-1`}
                />
              </label>
              <button type="button" className={botaoSecundario} onClick={() => setTreinos(mover(treinos, indiceTreino, -1))}>
                Subir
              </button>
              <button type="button" className={botaoSecundario} onClick={() => setTreinos(mover(treinos, indiceTreino, 1))}>
                Descer
              </button>
              <button
                type="button"
                className={botaoSecundario}
                onClick={() => setTreinos(treinos.filter((_, posicao) => posicao !== indiceTreino))}
              >
                Remover
              </button>
            </div>
            <label className="mt-3 block text-sm">
              Observação do treino
              <input
                value={treino.observacao}
                onChange={(evento) => atualizarTreino(indiceTreino, { ...treino, observacao: evento.target.value })}
                className={`${campo} mt-1`}
              />
            </label>
            <div className="mt-4 space-y-3">
              {treino.exercicios.map((exercicio, indiceExercicio) => (
                <div key={indiceExercicio} className="grid gap-2 rounded-md bg-cartao p-3 sm:grid-cols-6">
                  <input
                    aria-label="Nome do exercício"
                    placeholder="Exercício"
                    value={exercicio.nome}
                    onChange={(evento) => {
                      const exercicios = treino.exercicios.map((item, posicao) =>
                        posicao === indiceExercicio ? { ...item, nome: evento.target.value } : item,
                      );
                      atualizarTreino(indiceTreino, { ...treino, exercicios });
                    }}
                    className={`${campo} sm:col-span-2`}
                  />
                  <input
                    aria-label="Séries"
                    type="number"
                    min={1}
                    value={exercicio.series}
                    onChange={(evento) => {
                      const exercicios = treino.exercicios.map((item, posicao) =>
                        posicao === indiceExercicio ? { ...item, series: Number(evento.target.value) } : item,
                      );
                      atualizarTreino(indiceTreino, { ...treino, exercicios });
                    }}
                    className={campo}
                  />
                  <input
                    aria-label="Repetições"
                    placeholder="Repetições"
                    value={exercicio.repeticoes}
                    onChange={(evento) => {
                      const exercicios = treino.exercicios.map((item, posicao) =>
                        posicao === indiceExercicio ? { ...item, repeticoes: evento.target.value } : item,
                      );
                      atualizarTreino(indiceTreino, { ...treino, exercicios });
                    }}
                    className={campo}
                  />
                  <input
                    aria-label="Carga"
                    placeholder="Carga"
                    value={exercicio.carga}
                    onChange={(evento) => {
                      const exercicios = treino.exercicios.map((item, posicao) =>
                        posicao === indiceExercicio ? { ...item, carga: evento.target.value } : item,
                      );
                      atualizarTreino(indiceTreino, { ...treino, exercicios });
                    }}
                    className={campo}
                  />
                  <input
                    aria-label="Descanso"
                    placeholder="Descanso"
                    value={exercicio.descanso}
                    onChange={(evento) => {
                      const exercicios = treino.exercicios.map((item, posicao) =>
                        posicao === indiceExercicio ? { ...item, descanso: evento.target.value } : item,
                      );
                      atualizarTreino(indiceTreino, { ...treino, exercicios });
                    }}
                    className={campo}
                  />
                  <div className="flex gap-2 sm:col-span-6">
                    <button
                      type="button"
                      className={botaoSecundario}
                      onClick={() =>
                        atualizarTreino(indiceTreino, {
                          ...treino,
                          exercicios: mover(treino.exercicios, indiceExercicio, -1),
                        })
                      }
                    >
                      Subir
                    </button>
                    <button
                      type="button"
                      className={botaoSecundario}
                      onClick={() =>
                        atualizarTreino(indiceTreino, {
                          ...treino,
                          exercicios: mover(treino.exercicios, indiceExercicio, 1),
                        })
                      }
                    >
                      Descer
                    </button>
                    <button
                      type="button"
                      className={botaoSecundario}
                      onClick={() =>
                        atualizarTreino(indiceTreino, {
                          ...treino,
                          exercicios: treino.exercicios.filter((_, posicao) => posicao !== indiceExercicio),
                        })
                      }
                    >
                      Remover exercício
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className={botaoSecundario}
                onClick={() =>
                  atualizarTreino(indiceTreino, { ...treino, exercicios: [...treino.exercicios, exercicioVazio()] })
                }
              >
                Adicionar exercício
              </button>
            </div>
          </article>
        ))}
        <button
          type="button"
          className={botaoSecundario}
          onClick={() =>
            setTreinos([
              ...treinos,
              { nome: `Treino ${String.fromCharCode(65 + treinos.length)}`, observacao: "", exercicios: [exercicioVazio()] },
            ])
          }
        >
          Adicionar treino
        </button>
      </div>

      {erro && <p className="mt-4 text-sm text-acao">{erro}</p>}
      {erros.length > 0 && (
        <ul className="mt-2 list-disc pl-5 text-sm text-acao">
          {erros.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      <div className="mt-6 flex flex-wrap gap-2">
        <button type="button" disabled={salvando} onClick={() => void salvar()} className={botaoAcao}>
          {salvando ? "Salvando..." : "Salvar ficha"}
        </button>
        {ficha && !ficha.ativa && (
          <button type="button" disabled={salvando} onClick={() => void ativar()} className={botaoSecundario}>
            Tornar ativa
          </button>
        )}
        <button type="button" onClick={onCancelar} className={botaoSecundario}>
          Fechar
        </button>
      </div>
    </section>
  );
}
