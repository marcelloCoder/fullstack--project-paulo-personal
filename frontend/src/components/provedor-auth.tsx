"use client";

import { api } from "@/lib/api";
import type { Usuario } from "@/lib/tipos";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthContexto = {
  usuario: Usuario | null;
  pronto: boolean;
  definirUsuario: (usuario: Usuario | null) => void;
  sair: () => Promise<void>;
};

const Contexto = createContext<AuthContexto | null>(null);

export function ProvedorAuth({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [pronto, setPronto] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let ativo = true;
    api<Usuario>("/api/auth/me")
      .then((dados) => {
        if (ativo) setUsuario(dados);
      })
      .catch(() => {
        if (ativo) setUsuario(null);
      })
      .finally(() => {
        if (ativo) setPronto(true);
      });
    return () => {
      ativo = false;
    };
  }, []);

  const valor = useMemo<AuthContexto>(
    () => ({
      usuario,
      pronto,
      definirUsuario: setUsuario,
      sair: async () => {
        await api<void>("/api/auth/logout", { method: "POST" });
        setUsuario(null);
        router.push("/");
      },
    }),
    [usuario, pronto, router],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAuth() {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error("useAuth precisa ficar dentro de ProvedorAuth.");
  }
  return contexto;
}
