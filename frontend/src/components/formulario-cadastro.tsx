"use client";

import { useAuth } from "@/components/provedor-auth";
import { ApiError, api } from "@/lib/api";
import { botaoAcao, campo } from "@/lib/estilos";
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
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function cadastrar(evento: FormEvent) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const usuario = await api<Usuario>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ nome, email, telefone, senha }),
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
        Nome
        <input required value={nome} onChange={(evento) => setNome(evento.target.value)} className={`${campo} mt-1`} />
      </label>
      <label className="block text-sm">
        E-mail
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
        Telefone
        <input value={telefone} onChange={(evento) => setTelefone(evento.target.value)} className={`${campo} mt-1`} />
      </label>
      <label className="block text-sm">
        Senha
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={senha}
          onChange={(evento) => setSenha(evento.target.value)}
          className={`${campo} mt-1`}
        />
      </label>
      <p className="text-sm text-muted">Mínimo de 8 caracteres.</p>
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
