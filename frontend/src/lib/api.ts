export class ApiError extends Error {
  status: number;
  erros: string[];

  constructor(status: number, mensagem: string, erros: string[] = []) {
    super(mensagem);
    this.status = status;
    this.erros = erros;
  }
}

export async function api<T>(caminho: string, init?: RequestInit): Promise<T> {
  const resposta = await fetch(caminho, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (resposta.status === 204) {
    return undefined as T;
  }

  const dados = (await resposta.json().catch(() => null)) as {
    mensagem?: string;
    erros?: string[];
  } | null;

  if (!resposta.ok) {
    throw new ApiError(
      resposta.status,
      dados?.mensagem ?? "Não foi possível concluir a ação.",
      dados?.erros ?? [],
    );
  }

  return dados as T;
}
