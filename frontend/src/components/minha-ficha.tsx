"use client";

import { ApiError, api } from "@/lib/api";
import { perfil } from "@/content/perfil";
import { botaoSecundario, botaoWhatsapp } from "@/lib/estilos";
import type { Ficha } from "@/lib/tipos";
import { useEffect, useState } from "react";

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
      <div className="max-w-xl rounded-md border border-linha bg-cartao p-6">
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

  const treino = ficha.treinos[indice] ?? ficha.treinos[0];

  return (
    <div>
      <p className="text-sm uppercase tracking-[0.16em] text-acao">Ficha ativa</p>
      <h1 className="mt-1 font-display text-4xl uppercase tracking-wide">{ficha.titulo}</h1>
      {ficha.objetivo && <p className="mt-2 text-lg text-muted">{ficha.objetivo}</p>}
      {ficha.observacao && <p className="mt-3 max-w-2xl leading-7">{ficha.observacao}</p>}

      {ficha.treinos.length === 0 ? (
        <p className="mt-8 text-muted">Esta ficha ainda não tem treinos.</p>
      ) : (
        <>
          <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
            {ficha.treinos.map((item, posicao) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setIndice(posicao)}
                className={
                  posicao === indice
                    ? "shrink-0 rounded-full bg-acao px-4 py-2 font-display text-sm uppercase tracking-wider text-white"
                    : `${botaoSecundario} shrink-0 rounded-full`
                }
              >
                {item.nome}
              </button>
            ))}
          </div>
          {treino && (
            <section className="mt-4">
              {treino.observacao && <p className="mb-4 leading-7 text-muted">{treino.observacao}</p>}
              <div className="grid gap-3">
                {treino.exercicios.map((exercicio) => (
                  <article key={exercicio.id} className="rounded-md border border-linha bg-cartao p-4">
                    <h2 className="font-display text-2xl uppercase tracking-wide">{exercicio.nome}</h2>
                    <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                      <div>
                        <dt className="text-muted">Séries</dt>
                        <dd className="text-lg">{exercicio.series}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">Repetições</dt>
                        <dd className="text-lg">{exercicio.repeticoes}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">Carga</dt>
                        <dd className="text-lg">{exercicio.carga || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">Descanso</dt>
                        <dd className="text-lg">{exercicio.descanso || "—"}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
