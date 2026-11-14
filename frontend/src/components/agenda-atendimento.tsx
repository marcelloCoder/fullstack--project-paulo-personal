"use client";

import { useAuth } from "@/components/provedor-auth";
import {
  type SlotAgenda,
  DIAS_UTEIS_AGENDA,
  HORARIOS_GRADE,
  normalizarHorario,
  periodoDoHorario,
  rotuloPeriodo,
  tituloDiaAgenda,
} from "@/lib/agenda";
import { api, ApiError } from "@/lib/api";
import { botaoAcao, botaoSecundario, botaoWhatsapp } from "@/lib/estilos";
import { perfil } from "@/content/perfil";
import { useEffect, useMemo, useState } from "react";

type Periodo = "manha" | "tarde" | "noite";

export function AgendaAtendimento() {
  const { usuario, pronto } = useAuth();
  const admin = pronto && usuario?.papel === "ADMIN";

  const [diaAgenda, setDiaAgenda] = useState(1);
  const [slots, setSlots] = useState<SlotAgenda[]>([]);
  const [rascunho, setRascunho] = useState<Record<string, boolean>>({});
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    if (!pronto) return;
    let ativo = true;
    setCarregando(true);
    setErro("");
    setAviso("");

    const caminho = admin ? "/api/admin/agenda" : "/api/agenda";
    api<SlotAgenda[]>(caminho)
      .then((dados) => {
        if (!ativo) return;
        const normalizados = dados.map((slot) => ({
          ...slot,
          horario: normalizarHorario(slot.horario),
        }));
        setSlots(normalizados);
        if (admin) {
          const mapa: Record<string, boolean> = {};
          for (const slot of normalizados) {
            mapa[chaveSlot(slot.diaSemana, slot.horario)] = slot.disponivel;
          }
          setRascunho(mapa);
        }
      })
      .catch((falha) => {
        if (!ativo) return;
        setErro(falha instanceof ApiError ? falha.message : "Não foi possível carregar a agenda.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [admin, pronto]);

  const horariosVisiveis = useMemo(() => {
    if (admin) {
      return HORARIOS_GRADE;
    }
    return slots
      .filter((slot) => slot.diaSemana === diaAgenda && slot.disponivel)
      .map((slot) => normalizarHorario(slot.horario))
      .sort();
  }, [admin, diaAgenda, slots]);

  const porPeriodo = useMemo(() => {
    const grupos: Record<Periodo, string[]> = { manha: [], tarde: [], noite: [] };
    for (const horario of horariosVisiveis) {
      grupos[periodoDoHorario(horario)].push(horario);
    }
    return grupos;
  }, [horariosVisiveis]);

  function disponivelNoRascunho(horario: string) {
    return Boolean(rascunho[chaveSlot(diaAgenda, horario)]);
  }

  function alternar(horario: string) {
    if (!admin) return;
    const chave = chaveSlot(diaAgenda, horario);
    setRascunho((atual) => ({ ...atual, [chave]: !atual[chave] }));
    setAviso("");
  }

  async function salvar() {
    if (!admin) return;
    setSalvando(true);
    setErro("");
    setAviso("");
    try {
      const horarios = Object.entries(rascunho).map(([chave, disponivel]) => {
        const [diaTexto, horario] = chave.split("|");
        return {
          diaSemana: Number(diaTexto),
          horario,
          disponivel,
        };
      });
      const atualizados = await api<SlotAgenda[]>("/api/admin/agenda", {
        method: "PUT",
        body: JSON.stringify({ horarios }),
      });
      const normalizados = atualizados.map((slot) => ({
        ...slot,
        horario: normalizarHorario(slot.horario),
      }));
      setSlots(normalizados);
      const mapa: Record<string, boolean> = {};
      for (const slot of normalizados) {
        mapa[chaveSlot(slot.diaSemana, slot.horario)] = slot.disponivel;
      }
      setRascunho(mapa);
      setAviso("Agenda salva.");
    } catch (falha) {
      setErro(falha instanceof ApiError ? falha.message : "Não foi possível salvar a agenda.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="mt-12 rounded-md border border-linha bg-cartao p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-2xl uppercase tracking-wide text-tinta">Horários</h2>
        {admin && (
          <p className="text-sm text-muted">
            Modo admin: toque nos horários para liberar ou bloquear, depois salve.
          </p>
        )}
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {DIAS_UTEIS_AGENDA.map((dia) => {
          const ativo = dia.valor === diaAgenda;
          return (
            <button
              key={dia.valor}
              type="button"
              onClick={() => setDiaAgenda(dia.valor)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
                ativo
                  ? "border-acao bg-acao text-white"
                  : "border-linha bg-white text-tinta hover:border-acao hover:text-acao"
              }`}
            >
              {dia.rotulo}
            </button>
          );
        })}
      </div>

      <h3 className="mt-6 text-lg font-semibold text-tinta">
        {admin ? "Gerenciar horários de" : "Horários disponíveis para"} {tituloDiaAgenda(diaAgenda)}
      </h3>

      {carregando || !pronto ? (
        <p className="mt-4 text-sm text-muted">Carregando agenda...</p>
      ) : (
        <div className="mt-4 space-y-6">
          {(["manha", "tarde", "noite"] as Periodo[]).map((periodo) => {
            const lista = porPeriodo[periodo];
            if (!admin && lista.length === 0) return null;
            const listaAdmin = admin
              ? HORARIOS_GRADE.filter((horario) => periodoDoHorario(horario) === periodo)
              : lista;
            if (listaAdmin.length === 0) return null;
            return (
              <div key={periodo}>
                <p className="mb-3 text-sm font-medium text-muted">{rotuloPeriodo(periodo)}</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {listaAdmin.map((horario) => {
                    const liberado = admin ? disponivelNoRascunho(horario) : true;
                    return (
                      <button
                        key={horario}
                        type="button"
                        disabled={!admin}
                        onClick={() => alternar(horario)}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                          admin
                            ? liberado
                              ? "border-acao bg-acao/10 text-acao hover:bg-acao hover:text-white"
                              : "border-linha bg-fundo text-muted line-through opacity-70 hover:border-acao hover:text-acao hover:no-underline hover:opacity-100"
                            : "border-linha bg-white text-tinta"
                        } ${!admin ? "cursor-default" : ""}`}
                      >
                        <IconeRelogio className="h-4 w-4 shrink-0" />
                        <span>{horario}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {!admin && horariosVisiveis.length === 0 && (
            <p className="text-sm text-muted">Não há horários disponíveis neste dia.</p>
          )}
        </div>
      )}

      {admin && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" disabled={salvando || carregando} className={botaoAcao} onClick={() => void salvar()}>
            {salvando ? "Salvando..." : "Salvar agenda"}
          </button>
          <button
            type="button"
            disabled={salvando || carregando}
            className={botaoSecundario}
            onClick={() => {
              const mapa: Record<string, boolean> = {};
              for (const slot of slots) {
                mapa[chaveSlot(slot.diaSemana, normalizarHorario(slot.horario))] = slot.disponivel;
              }
              setRascunho(mapa);
              setAviso("");
              setErro("");
            }}
          >
            Desfazer alterações
          </button>
        </div>
      )}

      {aviso && <p className="mt-3 text-sm text-whatsapp">{aviso}</p>}
      {erro && <p className="mt-3 text-sm text-acao">{erro}</p>}

      <a href={perfil.whatsappLink} className={`${botaoWhatsapp} mt-8`}>
        Consultar horários no WhatsApp
      </a>
      <p className="mt-4 text-sm text-muted">{perfil.whatsappExibicao}</p>
    </section>
  );
}

function chaveSlot(diaSemana: number, horario: string) {
  return `${diaSemana}|${normalizarHorario(horario)}`;
}

function IconeRelogio({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5L15 15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
