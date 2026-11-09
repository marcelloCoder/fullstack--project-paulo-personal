import { perfil } from "@/content/perfil";

export function Rodape() {
  return (
    <footer className="mt-16 border-t border-linha">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          {perfil.nome} · {perfil.funcao}
        </p>
        <div className="flex gap-4">
          <a href={perfil.instagram} className="hover:text-acao">
            {perfil.instagramUsuario}
          </a>
          <a href={perfil.whatsappLink} className="hover:text-acao">
            {perfil.whatsappExibicao}
          </a>
        </div>
      </div>
    </footer>
  );
}
