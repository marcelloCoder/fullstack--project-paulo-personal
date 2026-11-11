export function RotuloCampo({ texto, pendente }: { texto: string; pendente: boolean }) {
  return (
    <>
      {texto}
      {pendente ? (
        <span className="ml-1 font-semibold text-acao" aria-label="campo pendente">
          *
        </span>
      ) : null}
    </>
  );
}
