"use client";

import { EditorFicha } from "@/components/editor-ficha";
import { ApiError, api } from "@/lib/api";
import { botaoAcao, botaoSecundario, campo } from "@/lib/estilos";
import type { Aluno, Ficha } from "@/lib/tipos";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

export function ListaAlunos() {
  const [busca, setBusca] = useState("");
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const controle = setTimeout(() => {
      const consulta = busca.trim() ? `?busca=${encodeURIComponent(busca.trim())}` : "";
      api<Aluno[]>(`/api/admin/alunos${consulta}`)
        .then(setAlunos)
        .catch((falha) => setErro(falha instanceof ApiError ? falha.message : "Não foi possível listar os alunos."));
    }, 250);
    return () => clearTimeout(controle);
  }, [busca]);

  return (
    <div>
      <h1 className="font-display text-4xl uppercase tracking-wide">Alunos</h1>
      <label className="mt-6 block max-w-md text-sm">
        Buscar por nome ou e-mail
        <input value={busca} onChange={(evento) => setBusca(evento.target.value)} className={`${campo} mt-1`} />
      </label>
      {erro && <p className="mt-4 text-acao">{erro}</p>}
      <div className="mt-6 overflow-hidden rounded-md border border-linha">
        {alunos.length === 0 ? (
          <p className="bg-cartao p-6 text-muted">Nenhum aluno encontrado.</p>
        ) : (
          <ul className="divide-y divide-linha bg-cartao">
            {alunos.map((aluno) => (
              <li key={aluno.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                <div>
                  <p className="font-medium">{aluno.nome}</p>
                  <p className="text-sm text-muted">{aluno.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={aluno.ativo ? "text-sm text-muted" : "text-sm text-acao"}>
                    {aluno.ativo ? "Ativo" : "Desativado"}
                  </span>
                  <Link href={`/admin/alunos/${aluno.id}`} className={botaoSecundario}>
                    Abrir
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function AlunoAdmin({ id }: { id: string }) {
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [editando, setEditando] = useState<Ficha | null | undefined>(undefined);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    const [dadosAluno, dadosFichas] = await Promise.all([
      api<Aluno>(`/api/admin/alunos/${id}`),
      api<Ficha[]>(`/api/admin/alunos/${id}/fichas`),
    ]);
    setAluno(dadosAluno);
    setFichas(dadosFichas);
    setEditando(undefined);
  }

  useEffect(() => {
    let cancelado = false;
    Promise.all([
      api<Aluno>(`/api/admin/alunos/${id}`),
      api<Ficha[]>(`/api/admin/alunos/${id}/fichas`),
    ])
      .then(([dadosAluno, dadosFichas]) => {
        if (cancelado) return;
        setAluno(dadosAluno);
        setFichas(dadosFichas);
      })
      .catch((falha) => {
        if (!cancelado) {
          setErro(falha instanceof ApiError ? falha.message : "Não foi possível abrir o aluno.");
        }
      });
    return () => {
      cancelado = true;
    };
  }, [id]);

  async function salvarAluno(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!aluno) return;
    setSalvando(true);
    setErro("");
    try {
      const atualizado = await api<Aluno>(`/api/admin/alunos/${aluno.id}`, {
        method: "PUT",
        body: JSON.stringify({
          nome: aluno.nome,
          email: aluno.email,
          telefone: aluno.telefone ?? "",
          ativo: aluno.ativo,
          objetivo: aluno.objetivo ?? "",
          observacao: aluno.observacao ?? "",
        }),
      });
      setAluno(atualizado);
    } catch (falha) {
      setErro(falha instanceof ApiError ? falha.message : "Não foi possível salvar o aluno.");
    } finally {
      setSalvando(false);
    }
  }

  if (erro && !aluno) return <p className="text-acao">{erro}</p>;
  if (!aluno) return <p className="text-muted">Carregando aluno...</p>;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin" className="text-sm text-acao">
          Voltar aos alunos
        </Link>
        <h1 className="mt-2 font-display text-4xl uppercase tracking-wide">{aluno.nome}</h1>
      </div>

      <form onSubmit={salvarAluno} className="grid gap-3 rounded-md border border-linha bg-cartao p-4 sm:grid-cols-2">
        <label className="text-sm">
          Nome
          <input
            value={aluno.nome}
            onChange={(evento) => setAluno({ ...aluno, nome: evento.target.value })}
            className={`${campo} mt-1`}
          />
        </label>
        <label className="text-sm">
          E-mail
          <input
            type="email"
            value={aluno.email}
            onChange={(evento) => setAluno({ ...aluno, email: evento.target.value })}
            className={`${campo} mt-1`}
          />
        </label>
        <label className="text-sm">
          Telefone
          <input
            value={aluno.telefone ?? ""}
            onChange={(evento) => setAluno({ ...aluno, telefone: evento.target.value })}
            className={`${campo} mt-1`}
          />
        </label>
        <label className="text-sm">
          Objetivo
          <input
            value={aluno.objetivo ?? ""}
            onChange={(evento) => setAluno({ ...aluno, objetivo: evento.target.value })}
            className={`${campo} mt-1`}
          />
        </label>
        <label className="text-sm sm:col-span-2">
          Observação
          <textarea
            value={aluno.observacao ?? ""}
            onChange={(evento) => setAluno({ ...aluno, observacao: evento.target.value })}
            className={`${campo} mt-1`}
            rows={3}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={aluno.ativo}
            onChange={(evento) => setAluno({ ...aluno, ativo: evento.target.checked })}
          />
          Aluno ativo
        </label>
        <div className="sm:text-right">
          <button type="submit" disabled={salvando} className={botaoAcao}>
            {salvando ? "Salvando..." : "Salvar aluno"}
          </button>
        </div>
        {erro && <p className="text-sm text-acao sm:col-span-2">{erro}</p>}
      </form>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl uppercase tracking-wide">Fichas</h2>
          <button type="button" className={botaoSecundario} onClick={() => setEditando(null)}>
            Nova ficha
          </button>
        </div>
        <ul className="mt-4 divide-y divide-linha overflow-hidden rounded-md border border-linha bg-cartao">
          {fichas.length === 0 && <li className="p-4 text-muted">Nenhuma ficha ainda.</li>}
          {fichas.map((ficha) => (
            <li key={ficha.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium">{ficha.titulo}</p>
                <p className="text-sm text-muted">
                  {ficha.inicio}
                  {ficha.ativa ? " · ativa" : ""}
                </p>
              </div>
              <button type="button" className={botaoSecundario} onClick={() => setEditando(ficha)}>
                Editar
              </button>
            </li>
          ))}
        </ul>
      </section>

      {editando !== undefined && (
        <EditorFicha
          key={editando?.id ?? "nova"}
          alunoId={aluno.id}
          ficha={editando}
          onSalva={carregar}
          onCancelar={() => setEditando(undefined)}
        />
      )}
    </div>
  );
}
