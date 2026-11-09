"use client";

import { useAuth } from "@/components/provedor-auth";
import { ApiError, api } from "@/lib/api";
import { botaoAcao, botaoSecundario } from "@/lib/estilos";
import type { Ficha } from "@/lib/tipos";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function formatarData(valor: string | null) {
  if (!valor) return null;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(valor));
}

export function MeuPerfil() {
  const { usuario, pronto, sair } = useAuth();
  const router = useRouter();
  const [ficha, setFicha] = useState<string | null>(null);
  const [semFicha, setSemFicha] = useState(false);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    if (!pronto) return;
    if (!usuario) {
      router.replace("/login");
    }
  }, [pronto, router, usuario]);

  useEffect(() => {
    if (usuario?.papel !== "ALUNO") return;
    api<Ficha>("/api/me/ficha")
      .then((dados) => setFicha(dados.titulo))
      .catch((falha) => {
        if (falha instanceof ApiError && falha.status === 404) {
          setSemFicha(true);
        }
      });
  }, [usuario]);

  if (!pronto || !usuario) {
    return <p className="text-muted">Carregando perfil...</p>;
  }

  const desde = formatarData(usuario.criadoEm);
  const admin = usuario.papel === "ADMIN";

  return (
    <div className="mx-auto max-w-2xl">
      <p className="font-script text-4xl text-acao">{admin ? "Administrador" : "Aluno"}</p>
      <h1 className="mt-1 font-display text-4xl uppercase tracking-wide">{usuario.nome}</h1>
      <p className="mt-3 text-muted">
        {admin
          ? "Esta é a única conta de administração do site."
          : desde
            ? `Aluno desde ${desde}.`
            : "Sua conta de aluno."}
      </p>

      <dl className="mt-8 divide-y divide-linha overflow-hidden rounded-md border border-linha bg-cartao">
        <Item rotulo="E-mail" valor={usuario.email} />
        <Item rotulo="Telefone" valor={usuario.telefone || "Não informado"} />
        {admin ? (
          <Item rotulo="Administrador desde" valor={desde || "Data não disponível"} />
        ) : (
          <Item rotulo="Aluno desde" valor={desde || "Data não disponível"} />
        )}
        <Item rotulo="Situação" valor={usuario.ativo ? "Conta ativa" : "Conta desativada"} />
        {!admin && <Item rotulo="Objetivo" valor={usuario.objetivo || "Ainda não definido com o Paulo"} />}
        {!admin && usuario.observacao && <Item rotulo="Observação do Paulo" valor={usuario.observacao} />}
        {!admin && <Item rotulo="Ficha ativa" valor={ficha || (semFicha ? "Nenhuma ficha ativa ainda" : "Carregando...")} />}
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        {admin ? (
          <Link href="/admin" className={botaoAcao}>
            Ver alunos
          </Link>
        ) : (
          <Link href="/app" className={botaoAcao}>
            Ver minha ficha
          </Link>
        )}
        <button
          type="button"
          className={botaoSecundario}
          disabled={saindo}
          onClick={() => {
            setSaindo(true);
            void sair();
          }}
        >
          {saindo ? "Saindo..." : "Sair"}
        </button>
      </div>
    </div>
  );
}

function Item({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="grid gap-1 px-4 py-4 sm:grid-cols-[11rem_1fr] sm:items-baseline">
      <dt className="text-sm text-muted">{rotulo}</dt>
      <dd>{valor}</dd>
    </div>
  );
}
