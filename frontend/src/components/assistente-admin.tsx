"use client";

import { ApiError, api } from "@/lib/api";
import { botaoAcao, botaoSecundario, campo } from "@/lib/estilos";
import type { AlunoRascunho, AssistenteChatResponse, FichaRascunho } from "@/lib/tipos";
import { useEffect, useRef, useState, type FormEvent } from "react";

type Mensagem = {
  id: string;
  papel: "user" | "model";
  texto: string;
  voz?: boolean;
  acao?: AssistenteChatResponse["acao"];
  rascunhoAluno?: AlunoRascunho | null;
  rascunhoFicha?: FichaRascunho | null;
};

const GRAVACAO_MAX_SEGUNDOS = 60;

function idMensagem() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AssistenteAdmin({
  alunoId,
  onAplicarAluno,
  onAplicarFicha,
}: {
  alunoId?: number;
  onAplicarAluno?: (rascunho: AlunoRascunho) => void;
  onAplicarFicha?: (rascunho: FichaRascunho) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [gravando, setGravando] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [erro, setErro] = useState("");
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: "boas-vindas",
      papel: "model",
      texto: alunoId
        ? "Posso sugerir fichas e ajustes de treino para este aluno. Peça, por exemplo: “monte uma ficha ABC 3x na semana”."
        : "Posso ajudar a cadastrar alunos e montar fichas. Peça, por exemplo: “cadastre um aluno iniciante focado em hipertrofia”.",
      acao: "ORIENTACAO",
    },
  ]);
  const fim = useRef<HTMLDivElement>(null);
  const mensagensRef = useRef(mensagens);
  const gravadorRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pedacosRef = useRef<Blob[]>([]);
  const cancelarRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  mensagensRef.current = mensagens;

  useEffect(() => {
    if (!aberto) return;
    fim.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [aberto, mensagens, enviando, gravando]);

  useEffect(() => {
    return () => {
      encerrarGravacao(true);
    };
  }, []);

  async function enviar(evento?: FormEvent) {
    evento?.preventDefault();
    const mensagem = texto.trim();
    if (!mensagem || enviando || gravando) return;

    setErro("");
    setTexto("");
    const usuario: Mensagem = { id: idMensagem(), papel: "user", texto: mensagem };
    setMensagens((atual) => [...atual, usuario]);
    setEnviando(true);

    const historico = [...mensagens, usuario]
      .filter((item) => item.id !== "boas-vindas")
      .slice(-10)
      .map((item) => ({ mensagem: item.texto, papel: item.papel }));

    try {
      const resposta = await api<AssistenteChatResponse>("/api/admin/assistente/chat", {
        method: "POST",
        body: JSON.stringify({
          mensagem,
          alunoId: alunoId ?? null,
          historico: historico.slice(0, -1),
        }),
      });
      setMensagens((atual) => [
        ...atual,
        {
          id: idMensagem(),
          papel: "model",
          texto: resposta.resposta,
          acao: resposta.acao,
          rascunhoAluno: resposta.rascunhoAluno,
          rascunhoFicha: resposta.rascunhoFicha,
        },
      ]);
    } catch (falha) {
      setErro(falha instanceof ApiError ? falha.message : "Não foi possível falar com o assistente.");
    } finally {
      setEnviando(false);
    }
  }

  function historicoAtual() {
    return mensagensRef.current
      .filter((item) => item.id !== "boas-vindas")
      .slice(-10)
      .map((item) => ({ mensagem: item.texto, papel: item.papel }));
  }

  function pararTimer() {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function soltarMicrofone() {
    streamRef.current?.getTracks().forEach((faixa) => faixa.stop());
    streamRef.current = null;
  }

  function encerrarGravacao(cancelar: boolean) {
    cancelarRef.current = cancelar;
    pararTimer();
    const gravador = gravadorRef.current;
    if (gravador && gravador.state !== "inactive") {
      gravador.stop();
      return;
    }
    soltarMicrofone();
    setGravando(false);
    setSegundos(0);
  }

  async function alternarGravacao() {
    if (enviando) return;
    if (gravando) {
      encerrarGravacao(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setErro("Este navegador não grava áudio. Escreva a mensagem.");
      return;
    }

    setErro("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"].find((tipo) =>
        MediaRecorder.isTypeSupported(tipo),
      );
      const gravador = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      pedacosRef.current = [];
      cancelarRef.current = false;
      gravador.ondataavailable = (evento) => {
        if (evento.data.size > 0) pedacosRef.current.push(evento.data);
      };
      gravador.onstop = () => {
        const tipo = gravador.mimeType || mime || "audio/webm";
        const blob = new Blob(pedacosRef.current, { type: tipo });
        gravadorRef.current = null;
        soltarMicrofone();
        pararTimer();
        setGravando(false);
        setSegundos(0);
        if (cancelarRef.current) return;
        if (blob.size < 800) {
          setErro("Não consegui ouvir a mensagem. Fale um pouco mais e tente de novo.");
          return;
        }
        void enviarVoz(blob);
      };
      gravadorRef.current = gravador;
      gravador.start();
      setGravando(true);
      setSegundos(0);
      const inicio = Date.now();
      timerRef.current = window.setInterval(() => {
        const decorrido = Math.min(GRAVACAO_MAX_SEGUNDOS, Math.floor((Date.now() - inicio) / 1000));
        setSegundos(decorrido);
        if (decorrido >= GRAVACAO_MAX_SEGUNDOS && gravador.state === "recording") {
          cancelarRef.current = false;
          gravador.stop();
        }
      }, 250);
    } catch {
      soltarMicrofone();
      setGravando(false);
      setErro("Permita o microfone para enviar uma mensagem de voz.");
    }
  }

  async function enviarVoz(blob: Blob) {
    if (enviando) return;
    setErro("");
    setEnviando(true);
    const idUsuario = idMensagem();
    setMensagens((atual) => [...atual, { id: idUsuario, papel: "user", texto: "Mensagem de voz", voz: true }]);

    const form = new FormData();
    const tipo = blob.type || "audio/webm";
    const nome = tipo.includes("ogg") ? "voz.ogg" : tipo.includes("mp4") ? "voz.m4a" : tipo.includes("wav") ? "voz.wav" : "voz.webm";
    form.append("audio", blob, nome);
    if (alunoId != null) form.append("alunoId", String(alunoId));
    form.append("historico", JSON.stringify(historicoAtual()));

    try {
      const resposta = await api<AssistenteChatResponse>("/api/admin/assistente/voz", {
        method: "POST",
        body: form,
      });
      const transcricao = resposta.transcricao?.trim() || "Mensagem de voz";
      setMensagens((atual) => [
        ...atual.map((item) => (item.id === idUsuario ? { ...item, texto: transcricao, voz: true } : item)),
        {
          id: idMensagem(),
          papel: "model",
          texto: resposta.resposta,
          acao: resposta.acao,
          rascunhoAluno: resposta.rascunhoAluno,
          rascunhoFicha: resposta.rascunhoFicha,
        },
      ]);
    } catch (falha) {
      setMensagens((atual) => atual.filter((item) => item.id !== idUsuario));
      setErro(falha instanceof ApiError ? falha.message : "Não foi possível entender a mensagem de voz.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-md bg-tinta px-4 py-3 font-display text-sm uppercase tracking-[0.14em] text-cartao shadow-lg transition hover:bg-acao"
        onClick={() => {
          if (aberto) encerrarGravacao(true);
          setAberto((valor) => !valor);
        }}
        aria-expanded={aberto}
      >
        {aberto ? "Fechar IA" : "Assistente IA"}
      </button>

      {aberto && (
        <section
          className="fixed bottom-20 right-5 z-40 flex h-[min(34rem,calc(100vh-7rem))] w-[min(26rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-md border border-linha bg-cartao shadow-xl"
          aria-label="Assistente de inteligência artificial"
        >
          <header className="border-b border-linha bg-fundo px-4 py-3">
            <h2 className="font-display text-lg uppercase tracking-wide">Assistente</h2>
            <p className="mt-1 text-xs text-muted">
              Sugestões para revisão. Nada é gravado até você aplicar e salvar.
            </p>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {mensagens.map((mensagem) => (
              <article
                key={mensagem.id}
                className={`rounded-md px-3 py-2 text-sm ${
                  mensagem.papel === "user" ? "ml-8 bg-tinta text-cartao" : "mr-4 border border-linha bg-fundo text-tinta"
                }`}
              >
                {mensagem.voz && (
                  <p className="mb-1 text-[10px] uppercase tracking-[0.14em] opacity-70">Voz</p>
                )}
                <p className="whitespace-pre-wrap">{mensagem.texto}</p>
                {mensagem.papel === "model" && mensagem.acao === "RASCUNHO_ALUNO" && mensagem.rascunhoAluno && (
                  <div className="mt-3 rounded-md border border-linha bg-cartao p-3 text-tinta">
                    <p className="font-medium">Rascunho de aluno</p>
                    <p className="mt-1 text-xs text-muted">
                      {mensagem.rascunhoAluno.nome}
                      {mensagem.rascunhoAluno.objetivo ? ` — ${mensagem.rascunhoAluno.objetivo}` : ""}
                    </p>
                    {onAplicarAluno ? (
                      <button
                        type="button"
                        className={`${botaoAcao} mt-3 w-full`}
                        onClick={() => {
                          onAplicarAluno(mensagem.rascunhoAluno!);
                          setAberto(false);
                        }}
                      >
                        Aplicar no formulário
                      </button>
                    ) : (
                      <p className="mt-2 text-xs text-muted">Abra a lista de alunos para aplicar o cadastro.</p>
                    )}
                  </div>
                )}
                {mensagem.papel === "model" && mensagem.acao === "RASCUNHO_FICHA" && mensagem.rascunhoFicha && (
                  <div className="mt-3 rounded-md border border-linha bg-cartao p-3 text-tinta">
                    <p className="font-medium">Rascunho de ficha</p>
                    <p className="mt-1 text-xs text-muted">
                      {mensagem.rascunhoFicha.titulo} — {mensagem.rascunhoFicha.treinos?.length ?? 0} treino(s)
                    </p>
                    {onAplicarFicha ? (
                      <button
                        type="button"
                        className={`${botaoAcao} mt-3 w-full`}
                        onClick={() => {
                          onAplicarFicha(mensagem.rascunhoFicha!);
                          setAberto(false);
                        }}
                      >
                        Abrir no editor
                      </button>
                    ) : (
                      <p className="mt-2 text-xs text-muted">Abra um aluno para aplicar a ficha no editor.</p>
                    )}
                  </div>
                )}
              </article>
            ))}
            {enviando && <p className="text-sm text-muted">{gravando ? "Ouvindo..." : "Pensando..."}</p>}
            <div ref={fim} />
          </div>

          <form onSubmit={(evento) => void enviar(evento)} className="border-t border-linha bg-fundo p-3">
            {erro && <p className="mb-2 text-sm text-acao">{erro}</p>}
            <textarea
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              className={`${campo} min-h-20 resize-none`}
              placeholder={gravando ? "Ouvindo..." : "Ex.: monte uma ficha full body 3x na semana"}
              maxLength={2000}
              disabled={enviando || gravando}
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={`h-12 w-12 shrink-0 overflow-hidden rounded-full disabled:cursor-not-allowed disabled:opacity-60 ${
                    gravando ? "animate-pulse ring-2 ring-acao ring-offset-2 ring-offset-fundo" : ""
                  }`}
                  onClick={() => void alternarGravacao()}
                  disabled={enviando}
                  aria-pressed={gravando}
                  aria-label={gravando ? "Parar e enviar mensagem de voz" : "Gravar mensagem de voz"}
                >
                  <img src="/microfone-voz.png" alt="" className="h-full w-full object-cover" />
                </button>
                {gravando && (
                  <>
                    <span className="text-sm text-muted">
                      Ouvindo... {Math.floor(segundos / 60)}:{String(segundos % 60).padStart(2, "0")}
                    </span>
                    <button type="button" className={botaoSecundario} onClick={() => encerrarGravacao(true)}>
                      Cancelar
                    </button>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={botaoSecundario}
                  disabled={enviando || gravando || !texto.trim()}
                  onClick={() => setTexto("")}
                >
                  Limpar
                </button>
                <button type="submit" className={botaoAcao} disabled={enviando || gravando || !texto.trim()}>
                  {enviando ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </div>
          </form>
        </section>
      )}
    </>
  );
}
