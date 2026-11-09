import { AlunoAdmin } from "@/components/painel-admin";
import { ExigePapel } from "@/components/exige-papel";
import { Suspense } from "react";

export default function PaginaDoAluno({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-8 text-muted">Carregando aluno...</p>}>
      <Conteudo params={params} />
    </Suspense>
  );
}

async function Conteudo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <ExigePapel papel="ADMIN">
        <AlunoAdmin id={id} />
      </ExigePapel>
    </div>
  );
}
