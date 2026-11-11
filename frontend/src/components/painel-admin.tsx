"use client";

import { CampoSenha } from "@/components/campo-senha";
import { EditorFicha } from "@/components/editor-ficha";
import { ListaFichas } from "@/components/lista-fichas";
import { RotuloCampo } from "@/components/rotulo-campo";
import { ApiError, api } from "@/lib/api";
import { temDadosPendentes } from "@/lib/dados-aluno";
import { botaoAcao, botaoSecundario, campo } from "@/lib/estilos";
import {
  alturaParaTexto,
  idadeParaTexto,
  textoParaAltura,
  textoParaIdade,
  textoParaPeso,
  pesoParaTexto,
} from "@/lib/peso";
import type { Aluno, Ficha } from "@/lib/tipos";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

type OrdemAlfabetica = "az" | "za";

function ordenarAlunos(lista: Aluno[], ordem: OrdemAlfabetica) {
  const sentido = ordem === "az" ? 1 : -1;
  return [...lista].sort((primeiro, segundo) => {
    if (primeiro.ativo !== segundo.ativo) return primeiro.ativo ? -1 : 1;
    return primeiro.nome.localeCompare(segundo.nome, "pt-BR") * sentido;
  });
}

function ordenarColuna(lista: Aluno[], ordem: OrdemAlfabetica) {
  const sentido = ordem === "az" ? 1 : -1;
  return [...lista].sort((primeiro, segundo) => primeiro.nome.localeCompare(segundo.nome, "pt-BR") * sentido);
}

const alunoVazio = {
  nome: "",
  email: "",
  telefone: "",
  idade: "",
  profissao: "",
  altura: "",
  peso: "",
  senha: "",
  objetivo: "",
  observacao: "",
};

export function ListaAlunos() {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<OrdemAlfabetica>("az");
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [erro, setErro] = useState("");
  const [cadastrando, setCadastrando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [formulario, setFormulario] = useState(alunoVazio);
  const [alternandoId, setAlternandoId] = useState<number | null>(null);

  useEffect(() => {
    const controle = setTimeout(() => {
      const consulta = busca.trim() ? `?busca=${encodeURIComponent(busca.trim())}` : "";
      api<Aluno[]>(`/api/admin/alunos${consulta}`)
        .then((lista) => setAlunos(ordenarAlunos(lista, ordem)))
        .catch((falha) => setErro(falha instanceof ApiError ? falha.message : "Não foi possível listar os alunos."));
    }, 250);
    return () => clearTimeout(controle);
  }, [busca, ordem]);

  async function alternarAtivo(aluno: Aluno) {
    const proximo = !aluno.ativo;
    setAlternandoId(aluno.id);
    setErro("");
    setAlunos((lista) =>
      ordenarAlunos(
        lista.map((item) => (item.id === aluno.id ? { ...item, ativo: proximo } : item)),
        ordem,
      ),
    );
    try {
      const atualizado = await api<Aluno>(`/api/admin/alunos/${aluno.id}/ativo`, {
        method: "PATCH",
        body: JSON.stringify({ ativo: proximo }),
      });
      setAlunos((lista) =>
        ordenarAlunos(
          lista.map((item) => (item.id === aluno.id ? atualizado : item)),
          ordem,
        ),
      );
    } catch (falha) {
      setAlunos((lista) =>
        ordenarAlunos(
          lista.map((item) => (item.id === aluno.id ? aluno : item)),
          ordem,
        ),
      );
      setErro(falha instanceof ApiError ? falha.message : "Não foi possível alterar o status do aluno.");
    } finally {
      setAlternandoId(null);
    }
  }

  async function cadastrar(evento: FormEvent) {
    evento.preventDefault();
    setErro("");
    const idade = textoParaIdade(formulario.idade);
    if (idade === null) {
      setErro("Informe a idade em anos, por exemplo 28.");
      return;
    }
    const alturaM = textoParaAltura(formulario.altura);
    if (alturaM === null) {
      setErro("Informe a altura em metros, por exemplo 1,70.");
      return;
    }
    const pesoKg = textoParaPeso(formulario.peso);
    if (pesoKg === null) {
      setErro("Informe o peso em kg, por exemplo 72,5.");
      return;
    }
    if (
      !formulario.telefone.trim() ||
      !formulario.profissao.trim() ||
      !formulario.objetivo.trim()
    ) {
      setErro("Preencha telefone, profissão e objetivo.");
      return;
    }
    setSalvando(true);
    try {
      const criado = await api<Aluno>("/api/admin/alunos", {
        method: "POST",
        body: JSON.stringify({
          nome: formulario.nome,
          email: formulario.email,
          telefone: formulario.telefone,
          senha: formulario.senha,
          idade,
          profissao: formulario.profissao,
          alturaM,
          pesoKg,
          objetivo: formulario.objetivo,
          observacao: formulario.observacao,
        }),
      });
      router.push(`/admin/alunos/${criado.id}`);
    } catch (falha) {
      setErro(falha instanceof ApiError ? falha.message : "Não foi possível cadastrar o aluno.");
      setSalvando(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-4xl uppercase tracking-wide">Alunos</h1>
        <button type="button" className={botaoAcao} onClick={() => setCadastrando((aberto) => !aberto)}>
          {cadastrando ? "Fechar" : "Novo aluno"}
        </button>
      </div>
      {cadastrando && (
        <form onSubmit={cadastrar} className="mt-6 grid gap-3 rounded-md border border-linha bg-cartao p-4 sm:grid-cols-2">
          <p className="text-sm text-muted sm:col-span-2">
            O aluno entra com este e-mail e esta senha. A conta criada é sempre de aluno.
          </p>
          <Campo rotulo="Nome" valor={formulario.nome} aoMudar={(nome) => setFormulario({ ...formulario, nome })} obrigatorio />
          <Campo
            rotulo="E-mail"
            tipo="email"
            valor={formulario.email}
            aoMudar={(email) => setFormulario({ ...formulario, email })}
            obrigatorio
          />
          <Campo
            rotulo="Telefone"
            valor={formulario.telefone}
            aoMudar={(telefone) => setFormulario({ ...formulario, telefone })}
            obrigatorio
          />
          <Campo
            rotulo="Idade"
            valor={formulario.idade}
            aoMudar={(idade) => setFormulario({ ...formulario, idade })}
            obrigatorio
          />
          <Campo
            rotulo="Profissão"
            valor={formulario.profissao}
            aoMudar={(profissao) => setFormulario({ ...formulario, profissao })}
            obrigatorio
          />
          <Campo
            rotulo="Altura (m)"
            valor={formulario.altura}
            aoMudar={(altura) => setFormulario({ ...formulario, altura })}
            obrigatorio
          />
          <Campo
            rotulo="Peso (kg)"
            valor={formulario.peso}
            aoMudar={(peso) => setFormulario({ ...formulario, peso })}
            obrigatorio
          />
          <CampoSenha
            rotulo="Senha inicial"
            valor={formulario.senha}
            aoMudar={(senha) => setFormulario({ ...formulario, senha })}
            obrigatorio
            minimo={8}
            autoComplete="new-password"
          />
          <Campo
            rotulo="Objetivo"
            valor={formulario.objetivo}
            aoMudar={(objetivo) => setFormulario({ ...formulario, objetivo })}
            obrigatorio
          />
          <label className="text-sm">
            Observação
            <textarea
              value={formulario.observacao}
              onChange={(evento) => setFormulario({ ...formulario, observacao: evento.target.value })}
              className={`${campo} mt-1`}
              rows={3}
            />
          </label>
          <div className="sm:col-span-2">
            <button type="submit" disabled={salvando} className={botaoAcao}>
              {salvando ? "Cadastrando..." : "Cadastrar aluno"}
            </button>
          </div>
        </form>
      )}
      <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
        <label className="block text-sm">
          Buscar por nome ou e-mail
          <input value={busca} onChange={(evento) => setBusca(evento.target.value)} className={`${campo} mt-1`} />
        </label>
        <label className="block text-sm">
          Ordem alfabética
          <select
            value={ordem}
            onChange={(evento) => setOrdem(evento.target.value as OrdemAlfabetica)}
            className={`${campo} mt-1`}
          >
            <option value="az">A–Z</option>
            <option value="za">Z–A</option>
          </select>
        </label>
      </div>
      {erro && <p className="mt-4 text-acao">{erro}</p>}
      {alunos.length === 0 ? (
        <p className="mt-6 rounded-md border border-linha bg-cartao p-6 text-muted">Nenhum aluno encontrado.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          <ColunaAlunos
            titulo="Ativos"
            vazio="Nenhum aluno ativo."
            alunos={ordenarColuna(
              alunos.filter((aluno) => aluno.ativo),
              ordem,
            )}
            alternandoId={alternandoId}
            aoAlternar={(aluno) => void alternarAtivo(aluno)}
          />
          <ColunaAlunos
            titulo="Desativados"
            vazio="Nenhum aluno desativado."
            alunos={ordenarColuna(
              alunos.filter((aluno) => !aluno.ativo),
              ordem,
            )}
            alternandoId={alternandoId}
            aoAlternar={(aluno) => void alternarAtivo(aluno)}
          />
        </div>
      )}
    </div>
  );
}

function ColunaAlunos({
  titulo,
  vazio,
  alunos,
  alternandoId,
  aoAlternar,
}: {
  titulo: string;
  vazio: string;
  alunos: Aluno[];
  alternandoId: number | null;
  aoAlternar: (aluno: Aluno) => void;
}) {
  const ativos = titulo === "Ativos";
  return (
    <section className="overflow-hidden rounded-md border border-linha bg-cartao">
      <h2
        className={`px-4 py-3 font-display text-lg uppercase tracking-wide text-white ${ativos ? "bg-ativo" : "bg-acao"}`}
      >
        {titulo}
        <span className="ml-2 text-sm tracking-normal text-white/80">{alunos.length}</span>
      </h2>
      {alunos.length === 0 ? (
        <p className="p-4 text-sm text-muted">{vazio}</p>
      ) : (
        <ul className="divide-y divide-linha">
          {alunos.map((aluno) => (
            <li key={aluno.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
              <div>
                <p className="font-medium">{aluno.nome}</p>
                {temDadosPendentes(aluno) && <p className="text-sm font-medium text-acao">dados pendentes</p>}
                <p className="text-sm text-muted">{aluno.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusAluno
                  ativo={aluno.ativo}
                  salvando={alternandoId === aluno.id}
                  aoAlternar={() => aoAlternar(aluno)}
                />
                <Link href={`/admin/alunos/${aluno.id}`} className={botaoSecundario}>
                  Abrir
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function StatusAluno({
  ativo,
  salvando,
  aoAlternar,
}: {
  ativo: boolean;
  salvando: boolean;
  aoAlternar: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      disabled={salvando}
      onClick={aoAlternar}
      className={`inline-flex min-w-28 items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium text-white transition disabled:opacity-60 ${
        ativo ? "bg-ativo hover:bg-ativo-hover" : "bg-acao hover:bg-acao-hover"
      }`}
    >
      {salvando ? "Salvando..." : ativo ? "Ativo" : "Desativado"}
    </button>
  );
}

function Campo({
  rotulo,
  valor,
  aoMudar,
  tipo = "text",
  obrigatorio = false,
  minimo,
}: {
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  tipo?: string;
  obrigatorio?: boolean;
  minimo?: number;
}) {
  return (
    <label className="text-sm">
      <RotuloCampo texto={rotulo} pendente={obrigatorio && !valor.trim()} />
      <input
        type={tipo}
        required={obrigatorio}
        minLength={minimo}
        value={valor}
        onChange={(evento) => aoMudar(evento.target.value)}
        className={`${campo} mt-1`}
      />
    </label>
  );
}

export function AlunoAdmin({ id }: { id: string }) {
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [editando, setEditando] = useState<Ficha | null | undefined>(undefined);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [alternando, setAlternando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [salvoComSucesso, setSalvoComSucesso] = useState(false);
  const [idade, setIdade] = useState("");
  const [profissao, setProfissao] = useState("");
  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");
  const router = useRouter();

  async function carregar() {
    const [dadosAluno, dadosFichas] = await Promise.all([
      api<Aluno>(`/api/admin/alunos/${id}`),
      api<Ficha[]>(`/api/admin/alunos/${id}/fichas`),
    ]);
    setAluno(dadosAluno);
    setIdade(idadeParaTexto(dadosAluno.idade));
    setProfissao(dadosAluno.profissao ?? "");
    setAltura(alturaParaTexto(dadosAluno.alturaM));
    setPeso(pesoParaTexto(dadosAluno.pesoKg));
    setFichas(dadosFichas);
    setEditando(undefined);
  }

  useEffect(() => {
    let cancelado = false;
    Promise.all([
      api<Aluno>(`/api/admin/alunos/${id}`),
      api<Ficha[]>(`/api/admin/alunos/${id}/fichas`),
    ])
      .then(([dadosAluno, dadosFichas]) => {
        if (cancelado) return;
        setAluno(dadosAluno);
        setIdade(idadeParaTexto(dadosAluno.idade));
        setProfissao(dadosAluno.profissao ?? "");
        setAltura(alturaParaTexto(dadosAluno.alturaM));
        setPeso(pesoParaTexto(dadosAluno.pesoKg));
        setFichas(dadosFichas);
      })
      .catch((falha) => {
        if (!cancelado) {
          setErro(falha instanceof ApiError ? falha.message : "Não foi possível abrir o aluno.");
        }
      });
    return () => {
      cancelado = true;
    };
  }, [id]);

  async function alternarAtivo() {
    if (!aluno) return;
    const proximo = !aluno.ativo;
    const anterior = aluno;
    setAlternando(true);
    setErro("");
    setAluno({ ...aluno, ativo: proximo });
    try {
      const atualizado = await api<Aluno>(`/api/admin/alunos/${aluno.id}/ativo`, {
        method: "PATCH",
        body: JSON.stringify({ ativo: proximo }),
      });
      setAluno((atual) => (atual ? { ...atual, ativo: atualizado.ativo } : atualizado));
    } catch (falha) {
      setAluno(anterior);
      setErro(falha instanceof ApiError ? falha.message : "Não foi possível alterar o status do aluno.");
    } finally {
      setAlternando(false);
    }
  }

  async function excluirAluno() {
    if (!aluno) return;
    setExcluindo(true);
    setErro("");
    try {
      await api<void>(`/api/admin/alunos/${aluno.id}`, { method: "DELETE" });
      router.push("/admin");
    } catch (falha) {
      setErro(falha instanceof ApiError ? falha.message : "Não foi possível excluir o aluno.");
      setExcluindo(false);
    }
  }

  useEffect(() => {
    if (!confirmando) return;
    function fecharComEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape" && !excluindo) setConfirmando(false);
    }
    document.addEventListener("keydown", fecharComEscape);
    return () => document.removeEventListener("keydown", fecharComEscape);
  }, [confirmando, excluindo]);

  useEffect(() => {
    if (!salvoComSucesso) return;
    function fecharComEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") setSalvoComSucesso(false);
    }
    const temporizador = window.setTimeout(() => setSalvoComSucesso(false), 2500);
    document.addEventListener("keydown", fecharComEscape);
    return () => {
      window.clearTimeout(temporizador);
      document.removeEventListener("keydown", fecharComEscape);
    };
  }, [salvoComSucesso]);

  async function salvarAluno(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!aluno) return;
    setSalvando(true);
    setErro("");
    setSalvoComSucesso(false);
    const idadeNumero = textoParaIdade(idade);
    if (idadeNumero === null) {
      setErro("Informe a idade em anos, por exemplo 28.");
      setSalvando(false);
      return;
    }
    const alturaM = textoParaAltura(altura);
    if (alturaM === null) {
      setErro("Informe a altura em metros, por exemplo 1,70.");
      setSalvando(false);
      return;
    }
    const pesoKg = textoParaPeso(peso);
    if (pesoKg === null) {
      setErro("Informe o peso em kg, por exemplo 72,5.");
      setSalvando(false);
      return;
    }
    if (!(aluno.telefone ?? "").trim() || !profissao.trim() || !(aluno.objetivo ?? "").trim()) {
      setErro("Preencha telefone, profissão e objetivo.");
      setSalvando(false);
      return;
    }
    try {
      const atualizado = await api<Aluno>(`/api/admin/alunos/${aluno.id}`, {
        method: "PUT",
        body: JSON.stringify({
          nome: aluno.nome,
          email: aluno.email,
          telefone: aluno.telefone ?? "",
          idade: idadeNumero,
          profissao,
          alturaM,
          pesoKg,
          ativo: aluno.ativo,
          objetivo: aluno.objetivo ?? "",
          observacao: aluno.observacao ?? "",
        }),
      });
      setAluno(atualizado);
      setIdade(idadeParaTexto(atualizado.idade));
      setProfissao(atualizado.profissao ?? "");
      setAltura(alturaParaTexto(atualizado.alturaM));
      setPeso(pesoParaTexto(atualizado.pesoKg));
      setSalvoComSucesso(true);
    } catch (falha) {
      setErro(falha instanceof ApiError ? falha.message : "Não foi possível salvar o aluno.");
    } finally {
      setSalvando(false);
    }
  }

  if (erro && !aluno) return <p className="text-acao">{erro}</p>;
  if (!aluno) return <p className="text-muted">Carregando aluno...</p>;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin" className="text-sm text-acao">
          Voltar aos alunos
        </Link>
        <h1 className="mt-2 font-display text-4xl uppercase tracking-wide">{aluno.nome}</h1>
      </div>

      <form onSubmit={salvarAluno} className="grid gap-3 rounded-md border border-linha bg-cartao p-4 sm:grid-cols-2">
        {temDadosPendentes({
          telefone: aluno.telefone,
          idade: textoParaIdade(idade),
          profissao,
          alturaM: textoParaAltura(altura),
          pesoKg: textoParaPeso(peso),
          objetivo: aluno.objetivo,
        }) && (
          <p className="text-sm text-acao sm:col-span-2">
            Há dados pendentes. Campos com * ainda precisam ser preenchidos.
          </p>
        )}
        <label className="text-sm">
          <RotuloCampo texto="Nome" pendente={!aluno.nome.trim()} />
          <input
            required
            value={aluno.nome}
            onChange={(evento) => setAluno({ ...aluno, nome: evento.target.value })}
            className={`${campo} mt-1`}
          />
        </label>
        <label className="text-sm">
          <RotuloCampo texto="E-mail" pendente={!aluno.email.trim()} />
          <input
            type="email"
            required
            value={aluno.email}
            onChange={(evento) => setAluno({ ...aluno, email: evento.target.value })}
            className={`${campo} mt-1`}
          />
        </label>
        <label className="text-sm">
          <RotuloCampo texto="Telefone" pendente={!(aluno.telefone ?? "").trim()} />
          <input
            required
            value={aluno.telefone ?? ""}
            onChange={(evento) => setAluno({ ...aluno, telefone: evento.target.value })}
            className={`${campo} mt-1`}
          />
        </label>
        <label className="text-sm">
          <RotuloCampo texto="Idade" pendente={!idade.trim()} />
          <input
            required
            inputMode="numeric"
            placeholder="28"
            value={idade}
            onChange={(evento) => setIdade(evento.target.value)}
            className={`${campo} mt-1`}
          />
        </label>
        <label className="text-sm">
          <RotuloCampo texto="Profissão" pendente={!profissao.trim()} />
          <input
            required
            value={profissao}
            onChange={(evento) => setProfissao(evento.target.value)}
            className={`${campo} mt-1`}
          />
        </label>
        <label className="text-sm">
          <RotuloCampo texto="Altura (m)" pendente={!altura.trim()} />
          <input
            required
            inputMode="decimal"
            placeholder="1,70"
            value={altura}
            onChange={(evento) => setAltura(evento.target.value)}
            className={`${campo} mt-1`}
          />
        </label>
        <label className="text-sm">
          <RotuloCampo texto="Peso (kg)" pendente={!peso.trim()} />
          <input
            required
            inputMode="decimal"
            placeholder="72,5"
            value={peso}
            onChange={(evento) => setPeso(evento.target.value)}
            className={`${campo} mt-1`}
          />
        </label>
        <label className="text-sm">
          <RotuloCampo texto="Objetivo" pendente={!(aluno.objetivo ?? "").trim()} />
          <input
            required
            value={aluno.objetivo ?? ""}
            onChange={(evento) => setAluno({ ...aluno, objetivo: evento.target.value })}
            className={`${campo} mt-1`}
          />
        </label>
        <label className="text-sm sm:col-span-2">
          Observação
          <textarea
            value={aluno.observacao ?? ""}
            onChange={(evento) => setAluno({ ...aluno, observacao: evento.target.value })}
            className={`${campo} mt-1`}
            rows={3}
          />
        </label>
        <div className="flex items-center gap-3">
          <StatusAluno ativo={aluno.ativo} salvando={alternando} aoAlternar={() => void alternarAtivo()} />
          <span className="text-sm text-muted">
            {aluno.ativo ? "Ativo porque há ficha cadastrada" : "Desativado até cadastrar uma ficha"}
          </span>
        </div>
        <div className="sm:text-right">
          <button type="submit" disabled={salvando} className={botaoAcao}>
            {salvando ? "Salvando..." : "Salvar aluno"}
          </button>
        </div>
        {erro && <p className="text-sm text-acao sm:col-span-2">{erro}</p>}
      </form>

      <ListaFichas
        fichas={fichas}
        aoNova={() => setEditando(null)}
        aoEditar={(ficha) => setEditando(ficha)}
        aoAtualizar={carregar}
      />

      {editando !== undefined && (
        <EditorFicha
          key={editando?.id ?? "nova"}
          alunoId={aluno.id}
          ficha={editando}
          onSalva={carregar}
          onCancelar={() => setEditando(undefined)}
        />
      )}

      <section className="rounded-md border border-acao/30 bg-cartao p-4">
        <h2 className="font-display text-lg uppercase tracking-wide">Excluir aluno</h2>
        <p className="mt-2 text-sm text-muted">
          Remove a conta, as fichas e os treinos deste aluno. O perfil será excluído para sempre.
        </p>
        <button type="button" className={`${botaoAcao} mt-4`} onClick={() => setConfirmando(true)}>
          Excluir aluno
        </button>
      </section>

      {confirmando && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-tinta/40 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="excluir-aluno-titulo"
            className="w-full max-w-md rounded-md border border-linha bg-cartao p-6 shadow-lg"
          >
            <h2 id="excluir-aluno-titulo" className="font-display text-2xl uppercase tracking-wide">
              Excluir {aluno.nome}?
            </h2>
            <p className="mt-3 text-muted">
              A conta, as fichas e os treinos serão apagados. Esta ação não pode ser desfeita.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                className={botaoSecundario}
                disabled={excluindo}
                onClick={() => setConfirmando(false)}
              >
                Cancelar
              </button>
              <button type="button" className={botaoAcao} disabled={excluindo} onClick={() => void excluirAluno()}>
                {excluindo ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {salvoComSucesso && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-tinta/40 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="aluno-salvo-titulo"
            className="w-full max-w-md rounded-md border border-ativo/40 bg-cartao p-6 shadow-lg"
          >
            <h2 id="aluno-salvo-titulo" className="font-display text-2xl uppercase tracking-wide text-ativo">
              Aluno salvo com sucesso
            </h2>
            <p className="mt-3 text-ativo">Os dados de {aluno.nome} foram atualizados.</p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md bg-ativo px-4 py-2 text-sm font-medium text-white transition hover:bg-ativo-hover"
                onClick={() => setSalvoComSucesso(false)}
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
