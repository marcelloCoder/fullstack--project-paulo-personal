"use client";

import { useAuth } from "@/components/provedor-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

export function MenuConta() {
  const { usuario, sair } = useAuth();
  const [aberto, setAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const caminho = usePathname();
  const menuId = useId();

  useEffect(() => {
    setAberto(false);
  }, [caminho]);

  useEffect(() => {
    if (!aberto) return;

    function fecharAoClicarFora(evento: MouseEvent) {
      if (!raiz.current?.contains(evento.target as Node)) {
        setAberto(false);
      }
    }

    function fecharComEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setAberto(false);
      }
    }

    document.addEventListener("mousedown", fecharAoClicarFora);
    document.addEventListener("keydown", fecharComEscape);
    return () => {
      document.removeEventListener("mousedown", fecharAoClicarFora);
      document.removeEventListener("keydown", fecharComEscape);
    };
  }, [aberto]);

  if (!usuario) return null;

  return (
    <div className="relative" ref={raiz}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={aberto}
        aria-controls={menuId}
        aria-label={`Conta de ${usuario.nome}`}
        onClick={() => setAberto((atual) => !atual)}
        className={`flex h-10 w-10 items-center justify-center rounded-full border bg-fundo transition hover:border-acao hover:text-acao ${
          aberto ? "border-acao text-acao" : "border-tinta/25 text-tinta"
        }`}
      >
        <IconeUsuario />
      </button>
      {aberto && (
        <div
          id={menuId}
          className="absolute right-0 z-30 mt-2 w-64 overflow-hidden rounded-md border border-linha bg-cartao shadow-lg"
        >
          <div className="border-b border-linha px-4 py-3">
            <p className="truncate font-display uppercase tracking-wide">{usuario.nome}</p>
            <p className="truncate text-xs text-muted">{usuario.email}</p>
          </div>
          <div className="flex flex-col py-1 text-sm">
            <Link href="/perfil" className="px-4 py-2.5 hover:bg-fundo hover:text-acao" onClick={() => setAberto(false)}>
              Meu perfil
            </Link>
            <Link
              href="/configuracoes"
              className="px-4 py-2.5 hover:bg-fundo hover:text-acao"
              onClick={() => setAberto(false)}
            >
              Configurações
            </Link>
          </div>
          <div className="border-t border-linha py-1">
            <button
              type="button"
              disabled={saindo}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-fundo hover:text-acao disabled:opacity-60"
              onClick={() => {
                setSaindo(true);
                void sair();
              }}
            >
              {saindo ? "Saindo..." : "Sair"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function IconeUsuario() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <circle cx="12" cy="8" r="3.1" fill="currentColor" />
      <path
        d="M5.2 19.4c.9-3.2 3.4-4.8 6.8-4.8s5.9 1.6 6.8 4.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
