"use client";

import { useAuth } from "@/components/provedor-auth";
import type { Papel } from "@/lib/tipos";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export function ExigePapel({
  papel,
  children,
}: {
  papel: Papel;
  children: ReactNode;
}) {
  const { usuario, pronto } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!pronto) return;
    if (!usuario) {
      router.replace("/login");
      return;
    }
    if (usuario.papel !== papel) {
      router.replace(usuario.papel === "ADMIN" ? "/admin" : "/app");
    }
  }, [papel, pronto, router, usuario]);

  if (!pronto) {
    return <p className="mx-auto max-w-6xl px-4 py-16 text-muted">Carregando...</p>;
  }
  if (!usuario || usuario.papel !== papel) {
    return null;
  }
  return children;
}
