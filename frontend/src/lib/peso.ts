export function textoParaPeso(valor: string): number | null {
  const texto = valor.trim().replace(",", ".");
  if (!texto) return null;
  if (!/^\d{1,3}(\.\d)?$/.test(texto)) return null;
  const numero = Number(texto);
  if (numero < 1 || numero > 500) return null;
  return numero;
}

export function pesoParaTexto(valor: number | null | undefined): string {
  if (valor == null) return "";
  return String(valor).replace(".", ",");
}

export function formatarPeso(valor: number | null | undefined): string {
  if (valor == null) return "Não informado";
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(valor)} kg`;
}

export function textoParaIdade(valor: string): number | null {
  const texto = valor.trim();
  if (!texto) return null;
  if (!/^\d{1,3}$/.test(texto)) return null;
  const numero = Number(texto);
  if (numero < 1 || numero > 120) return null;
  return numero;
}

export function idadeParaTexto(valor: number | null | undefined): string {
  if (valor == null) return "";
  return String(valor);
}

export function formatarIdade(valor: number | null | undefined): string {
  if (valor == null) return "Não informado";
  return `${valor} ${valor === 1 ? "ano" : "anos"}`;
}

export function textoParaAltura(valor: string): number | null {
  const texto = valor.trim().replace(",", ".");
  if (!texto) return null;
  if (!/^\d(\.\d{1,2})?$/.test(texto)) return null;
  const numero = Number(texto);
  if (numero < 0.5 || numero > 2.5) return null;
  return numero;
}

export function alturaParaTexto(valor: number | null | undefined): string {
  if (valor == null) return "";
  return String(valor).replace(".", ",");
}

export function formatarAltura(valor: number | null | undefined): string {
  if (valor == null) return "Não informado";
  return `${new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor)} m`;
}
