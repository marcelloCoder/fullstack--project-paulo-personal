"use client";

import { CampoSenha } from "@/components/campo-senha";
import { RotuloCampo } from "@/components/rotulo-campo";
import { useAuth } from "@/components/provedor-auth";
import { ApiError, api } from "@/lib/api";
import { temDadosPendentes } from "@/lib/dados-aluno";
import { botaoAcao, campo } from "@/lib/estilos";
import {
  alturaParaTexto,
  idadeParaTexto,
  textoParaAltura,
  textoParaIdade,
  textoParaPeso,
} from "@/lib/peso";
import type { Usuario } from "@/lib/tipos";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

export function FormularioConfiguracoes() {
  const { usuario, pronto, definirUsuario } = useAuth();
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [idade, setIdade] = useState("");
  const [profissao, setProfissao] = useState("");
  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [erroPerfil, setErroPerfil] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [avisoPerfil, setAvisoPerfil] = useState("");
  const [avisoSenha, setAvisoSenha] = useState("");
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  useEffect(() => {
    if (!pronto) return;
    if (!usuario) {
      router.replace("/login");
    }
  }, [pronto, router, usuario]);

  useEffect(() => {
    if (!usuario) return;
    setNome(usuario.nome);
    setEmail(usuario.email);
    setTelefone(usuario.telefone ?? "");
    setIdade(idadeParaTexto(usuario.idade));
    setProfissao(usuario.profissao ?? "");
    setAltura(alturaParaTexto(usuario.alturaM));
    setPeso(usuario.pesoKg == null ? "" : String(usuario.pesoKg).replace(".", ","));
    setObjetivo(usuario.objetivo ?? "");
  }, [usuario]);

  if (!pronto || !usuario) {
    return <p className="text-muted">Carregando configurações...</p>;
  }

  const admin = usuario.papel === "ADMIN";

  async function salvarPerfil(evento: FormEvent) {
    evento.preventDefault();
    setErroPerfil("");
    setAvisoPerfil("");
    const idadeNumero = textoParaIdade(idade);
    const alturaM = textoParaAltura(altura);
    const pesoKg = textoParaPeso(peso);
    if (!admin) {
      if (idadeNumero === null) {
        setErroPerfil("Informe a idade em anos, por exemplo 28.");
        return;
      }
      if (alturaM === null) {
        setErroPerfil("Informe a altura em metros, por exemplo 1,70.");
        return;
      }
      if (pesoKg === null) {
        setErroPerfil("Informe o peso em kg, por exemplo 72,5.");
        return;
      }
      if (!telefone.trim() || !profissao.trim() || !objetivo.trim()) {
        setErroPerfil("Preencha telefone, profissão e objetivo.");
        return;
      }
    }
    setSalvandoPerfil(true);
    try {
      const atualizado = await api<Usuario>("/api/auth/me", {
        method: "PUT",
        body: JSON.stringify({
          nome,
          email,
          telefone,
          idade: admin ? null : idadeNumero,
          profissao: admin ? null : profissao,
          alturaM: admin ? null : alturaM,
          pesoKg: admin ? null : pesoKg,
          objetivo: admin ? null : objetivo,
        }),
      });
      definirUsuario(atualizado);
      setAvisoPerfil("Perfil atualizado.");
    } catch (falha) {
      setErroPerfil(mensagemDe(falha, "Não foi possível salvar o perfil."));
    } finally {
      setSalvandoPerfil(false);
    }
  }

  async function salvarSenha(evento: FormEvent) {
    evento.preventDefault();
    setErroSenha("");
    setAvisoSenha("");
    setSalvandoSenha(true);
    try {
      await api<void>("/api/auth/me/senha", {
        method: "PUT",
        body: JSON.stringify({ senhaAtual, senhaNova }),
      });
      setSenhaAtual("");
      setSenhaNova("");
      setAvisoSenha("Senha alterada.");
    } catch (falha) {
      setErroSenha(mensagemDe(falha, "Não foi possível alterar a senha."));
    } finally {
      setSalvandoSenha(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="font-script text-4xl text-acao">Conta</p>
      <h1 className="mt-1 font-display text-4xl uppercase tracking-wide">Configurações</h1>
      <p className="mt-3 text-muted">
        {admin
          ? "Atualize seus dados. O papel de administrador permanece único neste site."
          : "Atualize seus dados. A observação do Paulo e a situação da conta continuam com ele."}
      </p>

      <form onSubmit={salvarPerfil} className="mt-8 space-y-4 rounded-md border border-linha bg-cartao p-6">
        <h2 className="font-display text-lg uppercase tracking-wide">Dados do perfil</h2>
        {!admin &&
          temDadosPendentes({
            telefone,
            idade: textoParaIdade(idade),
            profissao,
            alturaM: textoParaAltura(altura),
            pesoKg: textoParaPeso(peso),
            objetivo,
          }) && (
            <p className="text-sm text-acao">Há dados pendentes. Campos com * ainda precisam ser preenchidos.</p>
          )}
        <Campo rotulo="Nome" valor={nome} aoMudar={setNome} obrigatorio autoComplete="name" />
        <Campo rotulo="E-mail" tipo="email" valor={email} aoMudar={setEmail} obrigatorio autoComplete="email" />
        <Campo
          rotulo="Telefone"
          valor={telefone}
          aoMudar={setTelefone}
          obrigatorio={!admin}
          autoComplete="tel"
        />
        {!admin && (
          <>
            <label className="block text-sm">
              <RotuloCampo texto="Idade" pendente={!idade.trim()} />
              <input
                required
                inputMode="numeric"
                placeholder="28"
                value={idade}
                onChange={(evento) => setIdade(evento.target.value)}
                className={`${campo} mt-1`}
              />
            </label>
            <Campo rotulo="Profissão" valor={profissao} aoMudar={setProfissao} obrigatorio />
            <label className="block text-sm">
              <RotuloCampo texto="Altura (m)" pendente={!altura.trim()} />
              <input
                required
                inputMode="decimal"
                placeholder="1,70"
                value={altura}
                onChange={(evento) => setAltura(evento.target.value)}
                className={`${campo} mt-1`}
              />
            </label>
            <label className="block text-sm">
              <RotuloCampo texto="Peso (kg)" pendente={!peso.trim()} />
              <input
                required
                inputMode="decimal"
                placeholder="72,5"
                value={peso}
                onChange={(evento) => setPeso(evento.target.value)}
                className={`${campo} mt-1`}
              />
            </label>
            <label className="block text-sm">
              <RotuloCampo texto="Objetivo" pendente={!objetivo.trim()} />
              <textarea
                required
                value={objetivo}
                maxLength={200}
                onChange={(evento) => setObjetivo(evento.target.value)}
                className={`${campo} mt-1 min-h-24`}
              />
            </label>
          </>
        )}
        {erroPerfil && <p className="text-sm text-acao">{erroPerfil}</p>}
        {avisoPerfil && <p className="text-sm text-whatsapp">{avisoPerfil}</p>}
        <button type="submit" disabled={salvandoPerfil} className={botaoAcao}>
          {salvandoPerfil ? "Salvando..." : "Salvar perfil"}
        </button>
      </form>

      <form onSubmit={salvarSenha} className="mt-6 space-y-4 rounded-md border border-linha bg-cartao p-6">
        <h2 className="font-display text-lg uppercase tracking-wide">Senha</h2>
        <CampoSenha
          rotulo="Senha atual"
          valor={senhaAtual}
          aoMudar={setSenhaAtual}
          obrigatorio
          autoComplete="current-password"
        />
        <CampoSenha
          rotulo="Nova senha"
          valor={senhaNova}
          aoMudar={setSenhaNova}
          obrigatorio
          minimo={8}
          autoComplete="new-password"
        />
        <p className="text-sm text-muted">A nova senha precisa ter pelo menos 8 caracteres.</p>
        {erroSenha && <p className="text-sm text-acao">{erroSenha}</p>}
        {avisoSenha && <p className="text-sm text-whatsapp">{avisoSenha}</p>}
        <button type="submit" disabled={salvandoSenha} className={botaoAcao}>
          {salvandoSenha ? "Alterando..." : "Alterar senha"}
        </button>
      </form>

      <p className="mt-6 text-sm">
        <Link href="/perfil" className="text-acao hover:underline">
          Voltar ao perfil
        </Link>
      </p>
    </div>
  );
}

function Campo({
  rotulo,
  valor,
  aoMudar,
  tipo = "text",
  obrigatorio = false,
  autoComplete,
  minimo,
}: {
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  tipo?: string;
  obrigatorio?: boolean;
  autoComplete?: string;
  minimo?: number;
}) {
  return (
    <label className="block text-sm">
      <RotuloCampo texto={rotulo} pendente={obrigatorio && !valor.trim()} />
      <input
        type={tipo}
        required={obrigatorio}
        minLength={minimo}
        autoComplete={autoComplete}
        value={valor}
        onChange={(evento) => aoMudar(evento.target.value)}
        className={`${campo} mt-1`}
      />
    </label>
  );
}

function mensagemDe(falha: unknown, padrao: string) {
  if (!(falha instanceof ApiError)) return padrao;
  if (falha.erros.length > 0) return falha.erros.join(" ");
  return falha.message;
}
