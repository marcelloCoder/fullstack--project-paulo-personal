"use client";

import { useAuth } from "@/components/provedor-auth";
import { ApiError, api } from "@/lib/api";
import { botaoAcao, campo } from "@/lib/estilos";
import type { Usuario } from "@/lib/tipos";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function FormularioLogin() {
  const { definirUsuario } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(evento: FormEvent) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const usuario = await api<Usuario>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, senha }),
      });
      definirUsuario(usuario);
      router.push(usuario.papel === "ADMIN" ? "/admin" : "/app");
    } catch (falha) {
      setErro(falha instanceof ApiError ? falha.message : "Não foi possível entrar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={entrar} className="mx-auto mt-8 max-w-md space-y-4 rounded-md border border-linha bg-cartao p-6">
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
        Senha
        <input
          type="password"
          required
          autoComplete="current-password"
          value={senha}
          onChange={(evento) => setSenha(evento.target.value)}
          className={`${campo} mt-1`}
        />
      </label>
      {erro && <p className="text-sm text-acao">{erro}</p>}
      <button type="submit" disabled={enviando} className={`${botaoAcao} w-full`}>
        {enviando ? "Entrando..." : "Entrar"}
      </button>
      <p className="text-sm text-muted">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="text-acao">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
