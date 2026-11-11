"use client";

import { CampoSenha } from "@/components/campo-senha";
import { RotuloCampo } from "@/components/rotulo-campo";
import { useAuth } from "@/components/provedor-auth";
import { ApiError, api } from "@/lib/api";
import { botaoAcao, campo } from "@/lib/estilos";
import { textoParaAltura, textoParaIdade, textoParaPeso } from "@/lib/peso";
import type { Usuario } from "@/lib/tipos";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function FormularioCadastro() {
  const { definirUsuario } = useAuth();
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [idade, setIdade] = useState("");
  const [profissao, setProfissao] = useState("");
  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function cadastrar(evento: FormEvent) {
    evento.preventDefault();
    setErro("");
    const idadeNumero = textoParaIdade(idade);
    if (idadeNumero === null) {
      setErro("Informe a idade em anos, por exemplo 28.");
      return;
    }
    const alturaM = textoParaAltura(altura);
    if (alturaM === null) {
      setErro("Informe a altura em metros, por exemplo 1,70.");
      return;
    }
    const pesoKg = textoParaPeso(peso);
    if (pesoKg === null) {
      setErro("Informe o peso em kg, por exemplo 72,5.");
      return;
    }
    if (!telefone.trim() || !profissao.trim() || !objetivo.trim()) {
      setErro("Preencha telefone, profissão e objetivo.");
      return;
    }
    setEnviando(true);
    try {
      const usuario = await api<Usuario>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          nome,
          email,
          telefone,
          senha,
          idade: idadeNumero,
          profissao,
          alturaM,
          pesoKg,
          objetivo,
        }),
      });
      definirUsuario(usuario);
      router.push("/app");
    } catch (falha) {
      setErro(falha instanceof ApiError ? falha.message : "Não foi possível cadastrar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      onSubmit={cadastrar}
      className="mx-auto mt-8 max-w-md space-y-4 rounded-md border border-linha bg-cartao p-6"
    >
      <label className="block text-sm">
        <RotuloCampo texto="Nome" pendente={!nome.trim()} />
        <input required value={nome} onChange={(evento) => setNome(evento.target.value)} className={`${campo} mt-1`} />
      </label>
      <label className="block text-sm">
        <RotuloCampo texto="E-mail" pendente={!email.trim()} />
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          className={`${campo} mt-1`}
        />
      </label>
      <label className="block text-sm">
        <RotuloCampo texto="Telefone" pendente={!telefone.trim()} />
        <input
          required
          value={telefone}
          onChange={(evento) => setTelefone(evento.target.value)}
          className={`${campo} mt-1`}
        />
      </label>
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
      <label className="block text-sm">
        <RotuloCampo texto="Profissão" pendente={!profissao.trim()} />
        <input
          required
          value={profissao}
          onChange={(evento) => setProfissao(evento.target.value)}
          className={`${campo} mt-1`}
        />
      </label>
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
        <input
          required
          value={objetivo}
          onChange={(evento) => setObjetivo(evento.target.value)}
          className={`${campo} mt-1`}
        />
      </label>
      <CampoSenha rotulo="Senha" valor={senha} aoMudar={setSenha} obrigatorio minimo={8} autoComplete="new-password" />
      <p className="text-sm text-muted">Mínimo de 8 caracteres. Campos com * precisam ser preenchidos.</p>
      {erro && <p className="text-sm text-acao">{erro}</p>}
      <button type="submit" disabled={enviando} className={`${botaoAcao} w-full`}>
        {enviando ? "Criando conta..." : "Criar conta"}
      </button>
      <p className="text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="text-acao">
          Entrar
        </Link>
      </p>
    </form>
  );
}
