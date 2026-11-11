"use client";

import { campo } from "@/lib/estilos";
import { useId, useState } from "react";

export function CampoSenha({
  rotulo,
  valor,
  aoMudar,
  obrigatorio = false,
  autoComplete,
  minimo,
}: {
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  obrigatorio?: boolean;
  autoComplete?: string;
  minimo?: number;
}) {
  const [visivel, setVisivel] = useState(false);
  const id = useId();

  return (
    <div className="text-sm">
      <label htmlFor={id}>{rotulo}</label>
      <div className="relative mt-1">
        <input
          id={id}
          type={visivel ? "text" : "password"}
          required={obrigatorio}
          minLength={minimo}
          autoComplete={autoComplete}
          value={valor}
          onChange={(evento) => aoMudar(evento.target.value)}
          className={`${campo} pr-11`}
        />
        <button
          type="button"
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visivel}
          onClick={() => setVisivel((atual) => !atual)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-tinta/80 hover:text-tinta"
        >
          <IconeOlho riscado={visivel} />
        </button>
      </div>
    </div>
  );
}

function IconeOlho({ riscado }: { riscado: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M12 5.1C7.4 5.1 3.5 8 1.5 12c2 4 5.9 6.9 10.5 6.9s8.5-2.9 10.5-6.9c-2-4-5.9-6.9-10.5-6.9Zm0 11a4.1 4.1 0 1 1 0-8.2 4.1 4.1 0 0 1 0 8.2Zm0-1.8a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6Z"
      />
      {riscado && (
        <path d="M4 19.2 19.6 4.6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      )}
    </svg>
  );
}
