"use client";

import { useAuth } from "@/components/provedor-auth";
import { ApiError, api } from "@/lib/api";
import { botaoAcao, botaoSecundario } from "@/lib/estilos";
import { RotuloCampo } from "@/components/rotulo-campo";
import { temDadosPendentes } from "@/lib/dados-aluno";
import { formatarAltura, formatarIdade, formatarPeso } from "@/lib/peso";
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
  const { usuario, pronto } = useAuth();
  const router = useRouter();
  const [ficha, setFicha] = useState<string | null>(null);
  const [semFicha, setSemFicha] = useState(false);

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

      {!admin && temDadosPendentes(usuario) && (
        <p className="mt-4 text-sm font-medium text-acao">dados pendentes</p>
      )}

      <dl className="mt-8 divide-y divide-linha overflow-hidden rounded-md border border-linha bg-cartao">
        <Item rotulo="E-mail" valor={usuario.email} />
        <Item
          rotulo="Telefone"
          valor={usuario.telefone || "Não informado"}
          pendente={!admin && !usuario.telefone}
        />
        {!admin && (
          <Item rotulo="Idade" valor={formatarIdade(usuario.idade)} pendente={usuario.idade == null} />
        )}
        {!admin && (
          <Item
            rotulo="Profissão"
            valor={usuario.profissao || "Não informado"}
            pendente={!usuario.profissao}
          />
        )}
        {!admin && (
          <Item rotulo="Altura" valor={formatarAltura(usuario.alturaM)} pendente={usuario.alturaM == null} />
        )}
        {!admin && (
          <Item rotulo="Peso" valor={formatarPeso(usuario.pesoKg)} pendente={usuario.pesoKg == null} />
        )}
        {admin ? (
          <Item rotulo="Administrador desde" valor={desde || "Data não disponível"} />
        ) : (
          <Item rotulo="Aluno desde" valor={desde || "Data não disponível"} />
        )}
        <Item rotulo="Situação" valor={usuario.ativo ? "Conta ativa" : "Conta desativada"} />
        {!admin && (
          <Item
            rotulo="Objetivo"
            valor={usuario.objetivo || "Ainda não definido com o Paulo"}
            pendente={!usuario.objetivo}
          />
        )}
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
        <Link href="/configuracoes" className={botaoSecundario}>
          Editar perfil
        </Link>
      </div>
    </div>
  );
}

function Item({
  rotulo,
  valor,
  pendente = false,
}: {
  rotulo: string;
  valor: string;
  pendente?: boolean;
}) {
  return (
    <div className="grid gap-1 px-4 py-4 sm:grid-cols-[11rem_1fr] sm:items-baseline">
      <dt className="text-sm text-muted">
        <RotuloCampo texto={rotulo} pendente={pendente} />
      </dt>
      <dd>{valor}</dd>
    </div>
  );
}
