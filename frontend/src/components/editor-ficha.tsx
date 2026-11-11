"use client";

import { ApiError, api } from "@/lib/api";
import { DIAS_SEMANA } from "@/lib/dias-semana";
import { botaoAcao, botaoSecundario, campo } from "@/lib/estilos";
import type { ExercicioRascunho, Ficha, TreinoRascunho } from "@/lib/tipos";
import { useState } from "react";

const botaoMover =
  "inline-flex items-center justify-center rounded-md bg-muted px-4 py-2 text-sm text-cartao transition hover:bg-tinta disabled:opacity-60";

const botaoRemoverExercicio =
  "inline-flex items-center justify-center rounded-md bg-acao px-4 py-2 text-sm text-white transition hover:bg-acao-hover disabled:opacity-60";

function exercicioVazio(): ExercicioRascunho {
  return {
    nome: "",
    series: 3,
    repeticoes: 10,
    cargaKg: 0,
    descansoSegundos: 60,
    observacao: "",
  };
}

function inteiroSeguro(valor: string, minimo: number) {
  if (valor.trim() === "") return minimo;
  const numero = Number.parseInt(valor, 10);
  if (!Number.isFinite(numero)) return minimo;
  return Math.max(minimo, numero);
}

function decimalSeguro(valor: string, minimo: number) {
  const normalizado = valor.replace(",", ".").trim();
  if (normalizado === "") return minimo;
  const numero = Number.parseFloat(normalizado);
  if (!Number.isFinite(numero)) return minimo;
  return Math.max(minimo, numero);
}

function treinoVazio(nome: string): TreinoRascunho {
  return { nome, observacao: "", diasSemana: [], exercicios: [exercicioVazio()] };
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
      diasSemana: [...(treino.diasSemana ?? [])].sort((a, b) => a - b),
      exercicios: treino.exercicios.map((exercicio) => ({
        nome: exercicio.nome,
        series: exercicio.series,
        repeticoes: exercicio.repeticoes,
        cargaKg: Number(exercicio.cargaKg ?? 0),
        descansoSegundos: exercicio.descansoSegundos,
        observacao: exercicio.observacao ?? "",
      })),
    })) ?? [treinoVazio("Treino A")],
  );
  const [erro, setErro] = useState("");
  const [erros, setErros] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  function atualizarTreino(indice: number, treino: TreinoRascunho) {
    setTreinos((atual) => atual.map((item, posicao) => (posicao === indice ? treino : item)));
  }

  function diasOcupadosPorOutros(indiceTreino: number) {
    const ocupados = new Set<number>();
    treinos.forEach((treino, indice) => {
      if (indice === indiceTreino) return;
      treino.diasSemana.forEach((dia) => ocupados.add(dia));
    });
    return ocupados;
  }

  function alternarDia(indiceTreino: number, dia: number) {
    const treino = treinos[indiceTreino];
    if (!treino) return;
    const ocupados = diasOcupadosPorOutros(indiceTreino);
    if (ocupados.has(dia)) return;
    const jaSelecionado = treino.diasSemana.includes(dia);
    const diasSemana = jaSelecionado
      ? treino.diasSemana.filter((item) => item !== dia)
      : [...treino.diasSemana, dia].sort((a, b) => a - b);
    atualizarTreino(indiceTreino, { ...treino, diasSemana });
  }

  function atualizarExercicio(
    indiceTreino: number,
    indiceExercicio: number,
    patch: Partial<ExercicioRascunho>,
  ) {
    const treino = treinos[indiceTreino];
    if (!treino) return;
    const exercicios = treino.exercicios.map((item, posicao) =>
      posicao === indiceExercicio ? { ...item, ...patch } : item,
    );
    atualizarTreino(indiceTreino, { ...treino, exercicios });
  }

  async function salvar() {
    setErro("");
    setErros([]);
    for (const treino of treinos) {
      for (const exercicio of treino.exercicios) {
        if (!Number.isInteger(exercicio.series) || exercicio.series < 1) {
          setErro("Séries devem ser um número inteiro a partir de 1.");
          return;
        }
        if (!Number.isInteger(exercicio.repeticoes) || exercicio.repeticoes < 1) {
          setErro("Repetições devem ser um número inteiro a partir de 1.");
          return;
        }
        if (!Number.isFinite(exercicio.cargaKg) || exercicio.cargaKg < 0) {
          setErro("A carga deve ser informada em kg (número a partir de 0).");
          return;
        }
        if (!Number.isInteger(exercicio.descansoSegundos) || exercicio.descansoSegundos < 1) {
          setErro("O descanso deve ser um número inteiro de segundos a partir de 1.");
          return;
        }
      }
    }
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

  async function excluir() {
    if (!ficha) return;
    setErro("");
    setExcluindo(true);
    try {
      await api(`/api/admin/fichas/${ficha.id}`, { method: "DELETE" });
      await onSalva();
      onCancelar();
    } catch (falha) {
      setErro(falha instanceof ApiError ? falha.message : "Não foi possível excluir a ficha.");
    } finally {
      setExcluindo(false);
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
              <button type="button" className={botaoMover} onClick={() => setTreinos(mover(treinos, indiceTreino, -1))}>
                Subir
              </button>
              <button type="button" className={botaoMover} onClick={() => setTreinos(mover(treinos, indiceTreino, 1))}>
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
            <fieldset className="mt-4">
              <legend className="text-sm font-medium text-tinta">Dias da semana</legend>
              <p className="mt-1 text-xs text-muted">Cada dia só pode ficar em um treino desta ficha.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {DIAS_SEMANA.map((dia) => {
                  const selecionado = treino.diasSemana.includes(dia.valor);
                  const ocupado = diasOcupadosPorOutros(indiceTreino).has(dia.valor);
                  return (
                    <button
                      key={dia.valor}
                      type="button"
                      title={ocupado ? `${dia.nome} já está em outro treino` : dia.nome}
                      disabled={ocupado}
                      aria-pressed={selecionado}
                      onClick={() => alternarDia(indiceTreino, dia.valor)}
                      className={
                        selecionado
                          ? "rounded-full bg-acao px-3 py-1.5 text-sm font-medium text-white"
                          : ocupado
                            ? "cursor-not-allowed rounded-full border border-linha bg-fundo px-3 py-1.5 text-sm text-muted opacity-50"
                            : "rounded-full border border-linha bg-cartao px-3 py-1.5 text-sm text-tinta transition hover:border-acao hover:text-acao"
                      }
                    >
                      {dia.curto}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <div className="mt-4 space-y-3">
              {treino.exercicios.map((exercicio, indiceExercicio) => (
                <div key={indiceExercicio} className="space-y-2 rounded-md bg-cartao p-3">
                  <div className="grid gap-2 sm:grid-cols-6">
                    <label className="block text-xs text-muted sm:col-span-2">
                      Exercício
                      <input
                        aria-label="Nome do exercício"
                        placeholder="Nome do exercício"
                        value={exercicio.nome}
                        onChange={(evento) =>
                          atualizarExercicio(indiceTreino, indiceExercicio, { nome: evento.target.value })
                        }
                        className={`${campo} mt-1`}
                      />
                    </label>
                    <label className="block text-xs text-muted">
                      Séries (inteiro)
                      <input
                        aria-label="Séries"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        step={1}
                        value={exercicio.series}
                        onChange={(evento) =>
                          atualizarExercicio(indiceTreino, indiceExercicio, {
                            series: inteiroSeguro(evento.target.value, 1),
                          })
                        }
                        className={`${campo} mt-1`}
                      />
                    </label>
                    <label className="block text-xs text-muted">
                      Repetições (inteiro)
                      <input
                        aria-label="Repetições"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        step={1}
                        value={exercicio.repeticoes}
                        onChange={(evento) =>
                          atualizarExercicio(indiceTreino, indiceExercicio, {
                            repeticoes: inteiroSeguro(evento.target.value, 1),
                          })
                        }
                        className={`${campo} mt-1`}
                      />
                    </label>
                    <label className="block text-xs text-muted">
                      Carga (kg)
                      <input
                        aria-label="Carga em kg"
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step={0.5}
                        value={exercicio.cargaKg}
                        onChange={(evento) =>
                          atualizarExercicio(indiceTreino, indiceExercicio, {
                            cargaKg: decimalSeguro(evento.target.value, 0),
                          })
                        }
                        className={`${campo} mt-1`}
                      />
                    </label>
                    <label className="block text-xs text-muted">
                      Descanso (segundos)
                      <input
                        aria-label="Descanso em segundos"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        step={1}
                        value={exercicio.descansoSegundos}
                        onChange={(evento) =>
                          atualizarExercicio(indiceTreino, indiceExercicio, {
                            descansoSegundos: inteiroSeguro(evento.target.value, 1),
                          })
                        }
                        className={`${campo} mt-1`}
                      />
                    </label>
                  </div>
                  <label className="block text-xs text-muted">
                    Observação
                    <input
                      aria-label="Observação do exercício"
                      placeholder="Anotação para o aluno neste exercício"
                      value={exercicio.observacao}
                      onChange={(evento) =>
                        atualizarExercicio(indiceTreino, indiceExercicio, { observacao: evento.target.value })
                      }
                      className={`${campo} mt-1`}
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={botaoMover}
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
                      className={botaoMover}
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
                      className={botaoRemoverExercicio}
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
            setTreinos([...treinos, treinoVazio(`Treino ${String.fromCharCode(65 + treinos.length)}`)])
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
        <button type="button" disabled={salvando || excluindo} onClick={() => void salvar()} className={botaoAcao}>
          {salvando ? "Salvando..." : "Salvar ficha"}
        </button>
        {ficha && !ficha.ativa && (
          <button
            type="button"
            disabled={salvando || excluindo}
            onClick={() => void ativar()}
            className={botaoSecundario}
          >
            Tornar ativa
          </button>
        )}
        {ficha && (
          <button
            type="button"
            disabled={salvando || excluindo}
            className="inline-flex items-center justify-center rounded-md border border-acao/30 bg-acao/10 px-4 py-2 text-sm text-acao transition hover:bg-acao hover:text-white disabled:opacity-60"
            onClick={() => setConfirmandoExclusao(true)}
          >
            Remover ficha
          </button>
        )}
        <button type="button" disabled={excluindo} onClick={onCancelar} className={botaoSecundario}>
          Fechar
        </button>
      </div>

      {ficha && confirmandoExclusao && (
        <div className="mt-4 rounded-md border border-acao/30 bg-acao/5 p-4">
          <p className="text-sm text-tinta">
            Remover a ficha <span className="font-medium">{ficha.titulo}</span>? Os treinos e exercícios serão
            apagados. Esta ação não pode ser desfeita.
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
    </section>
  );
}
