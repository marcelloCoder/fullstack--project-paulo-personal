package com.pauloroberto.personal.assistente;

import com.pauloroberto.personal.comum.RecursoNaoEncontradoException;
import com.pauloroberto.personal.comum.RegraNegocioException;
import com.pauloroberto.personal.comum.Textos;
import com.pauloroberto.personal.ficha.FichaResponse;
import com.pauloroberto.personal.ficha.FichaService;
import com.pauloroberto.personal.usuario.AlunoResponse;
import com.pauloroberto.personal.usuario.AlunoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class AssistenteService {

    private static final Logger logger = LoggerFactory.getLogger(AssistenteService.class);
    private static final int HISTORICO_MAX = 10;
    private static final int HISTORICO_ENTRADA_MAX = 20;
    private static final long AUDIO_MAX_BYTES = 2L * 1024 * 1024;
    private static final Set<String> AUDIO_MIMES = Set.of("audio/webm", "audio/ogg", "audio/mp4", "audio/wav");

    private final GeminiClient geminiClient;
    private final AssistenteRateLimiter rateLimiter;
    private final AlunoService alunoService;
    private final FichaService fichaService;
    private final JsonMapper jsonMapper;

    public AssistenteService(
            GeminiClient geminiClient,
            AssistenteRateLimiter rateLimiter,
            AlunoService alunoService,
            FichaService fichaService,
            JsonMapper jsonMapper
    ) {
        this.geminiClient = geminiClient;
        this.rateLimiter = rateLimiter;
        this.alunoService = alunoService;
        this.fichaService = fichaService;
        this.jsonMapper = jsonMapper;
    }

    public AssistenteChatResponse conversar(Long adminId, AssistenteChatRequest request) {
        rateLimiter.verificar(adminId);
        return responder(request);
    }

    public AssistenteChatResponse ouvir(
            Long adminId,
            byte[] audio,
            String mimeType,
            Long alunoId,
            String historicoJson
    ) {
        rateLimiter.verificar(adminId);
        if (audio == null || audio.length == 0) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Envie um áudio para o assistente.");
        }
        if (audio.length > AUDIO_MAX_BYTES) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "O áudio pode ter no máximo 2 MB.");
        }
        String mime = normalizarMime(mimeType);
        if (!AUDIO_MIMES.contains(mime)) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Envie um áudio em formato compatível.");
        }

        String transcricao = limparTranscricao(geminiClient.transcrever(audio, mime));
        if (transcricao.isBlank()) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Não consegui entender o áudio. Tente de novo.");
        }

        AssistenteChatResponse resposta = responder(new AssistenteChatRequest(
                truncar(transcricao, 2000),
                alunoId,
                lerHistorico(historicoJson)
        ));
        return new AssistenteChatResponse(
                resposta.resposta(),
                resposta.acao(),
                resposta.rascunhoAluno(),
                resposta.rascunhoFicha(),
                truncar(transcricao, 2000)
        );
    }

    private AssistenteChatResponse responder(AssistenteChatRequest request) {
        String mensagem = request.mensagem().trim();
        List<GeminiClient.Conteudo> conversa = new ArrayList<>();
        List<AssistenteMensagemRequest> historico = request.historico() == null ? List.of() : request.historico();
        int inicio = Math.max(0, historico.size() - HISTORICO_MAX);
        for (int i = inicio; i < historico.size(); i++) {
            AssistenteMensagemRequest item = historico.get(i);
            String papel = normalizarPapel(item.papel());
            String texto = truncar(item.mensagem(), 2000);
            if (texto.isBlank()) {
                continue;
            }
            conversa.add(new GeminiClient.Conteudo(papel, texto));
        }
        conversa.add(new GeminiClient.Conteudo("user", mensagem));

        String contexto = montarContexto(request.alunoId());
        String bruto = geminiClient.gerar(systemPrompt(contexto), conversa);
        return interpretar(bruto);
    }

    private String montarContexto(Long alunoId) {
        if (alunoId == null) {
            return "Nenhum aluno selecionado. O personal está na lista geral de alunos.";
        }
        try {
            AlunoResponse aluno = alunoService.buscar(alunoId);
            List<FichaResponse> fichas = fichaService.listarDoAluno(alunoId);
            StringBuilder sb = new StringBuilder();
            sb.append("Aluno em contexto (id=").append(aluno.id()).append("):\n");
            sb.append("- Nome: ").append(nulo(aluno.nome())).append('\n');
            sb.append("- E-mail: ").append(nulo(aluno.email())).append('\n');
            sb.append("- Telefone: ").append(nulo(aluno.telefone())).append('\n');
            sb.append("- Idade: ").append(aluno.idade() == null ? "-" : aluno.idade()).append('\n');
            sb.append("- Profissão: ").append(nulo(aluno.profissao())).append('\n');
            sb.append("- Altura (m): ").append(aluno.alturaM() == null ? "-" : aluno.alturaM()).append('\n');
            sb.append("- Peso (kg): ").append(aluno.pesoKg() == null ? "-" : aluno.pesoKg()).append('\n');
            sb.append("- Objetivo: ").append(nulo(aluno.objetivo())).append('\n');
            sb.append("- Observação: ").append(nulo(aluno.observacao())).append('\n');
            sb.append("- Ativo: ").append(aluno.ativo()).append('\n');
            sb.append("- Fichas (").append(fichas.size()).append("):\n");
            if (fichas.isEmpty()) {
                sb.append("  (nenhuma)\n");
            } else {
                for (FichaResponse ficha : fichas) {
                    sb.append("  * ").append(ficha.titulo())
                            .append(ficha.ativa() ? " [ATIVA]" : "")
                            .append(" — início ").append(ficha.inicio())
                            .append(" — objetivo: ").append(nulo(ficha.objetivo()))
                            .append(" — treinos: ").append(ficha.treinos() == null ? 0 : ficha.treinos().size())
                            .append('\n');
                }
            }
            return sb.toString();
        } catch (RecursoNaoEncontradoException ex) {
            throw new RegraNegocioException(HttpStatus.NOT_FOUND, "Aluno não encontrado para o assistente.");
        } catch (Exception ex) {
            logger.warn("Não foi possível montar contexto do aluno {}: {}", alunoId, ex.getMessage());
            return "Não foi possível carregar o aluno " + alunoId + ".";
        }
    }

    private String systemPrompt(String contexto) {
        return """
                Você é o assistente de academia do personal trainer Paulo Roberto.
                Ajude somente o personal (admin) a cadastrar alunos e montar fichas de treino.
                Responda sempre em português do Brasil.
                Suas sugestões são educativas e de apoio; não faça diagnóstico médico nem prometa resultados clínicos.
                O personal sempre revisa antes de gravar: você só gera rascunhos.

                Contrato obrigatório de resposta (JSON único, sem markdown):
                {
                  "resposta": "texto curto para o personal",
                  "acao": "ORIENTACAO" | "RASCUNHO_ALUNO" | "RASCUNHO_FICHA",
                  "rascunhoAluno": null ou objeto,
                  "rascunhoFicha": null ou objeto
                }

                Quando acao=ORIENTACAO: rascunhoAluno e rascunhoFicha devem ser null.
                Quando acao=RASCUNHO_ALUNO: preencha rascunhoAluno e deixe rascunhoFicha=null.
                Quando acao=RASCUNHO_FICHA: preencha rascunhoFicha e deixe rascunhoAluno=null.

                Formato rascunhoAluno:
                {
                  "nome": string até 120,
                  "email": string até 180 (só se o personal informar; senão string vazia),
                  "telefone": string até 20,
                  "senha": string 8–72 (só se o personal pedir/sugerir; senão string vazia),
                  "idade": inteiro 1–120,
                  "profissao": string até 120,
                  "alturaM": número 0.50–2.50 com até 2 casas,
                  "pesoKg": número 1.0–500.0 com até 1 casa,
                  "objetivo": string até 200,
                  "observacao": string até 2000
                }

                Formato rascunhoFicha:
                {
                  "titulo": string até 120,
                  "objetivo": string até 200,
                  "observacao": string até 2000,
                  "inicio": "YYYY-MM-DD",
                  "treinos": [
                    {
                      "nome": string até 80,
                      "observacao": string até 1000,
                      "diasSemana": [0-6] (0=domingo ... 6=sábado; únicos entre treinos),
                      "exercicios": [
                        {
                          "nome": string até 120,
                          "series": 1–99,
                          "repeticoes": 1–999,
                          "cargaKg": >= 0,
                          "descansoSegundos": 1–3600,
                          "observacao": string até 500
                        }
                      ]
                    }
                  ]
                }

                Regras de treino:
                - Prefira exercícios comuns de academia com nomes claros em português.
                - Distribua grupos musculares de forma sensata.
                - Não repita o mesmo dia da semana em treinos diferentes.
                - Se faltar dado (e-mail, senha, lesão, disponibilidade), pergunte na resposta e use ORIENTACAO.
                - Nunca invente e-mail ou senha reais do aluno.

                Contexto atual:
                %s
                """.formatted(contexto);
    }

    private AssistenteChatResponse interpretar(String bruto) {
        try {
            String limpo = limparJson(bruto);
            JsonNode raiz = jsonMapper.readTree(limpo);
            String resposta = texto(raiz.path("resposta"), "Pronto. Revise a sugestão antes de salvar.");
            AssistenteAcao acao = parseAcao(raiz.path("acao").asText("ORIENTACAO"));

            RascunhoAlunoResponse aluno = null;
            RascunhoFichaResponse ficha = null;
            if (acao == AssistenteAcao.RASCUNHO_ALUNO) {
                aluno = normalizarAluno(raiz.path("rascunhoAluno"));
                if (aluno == null) {
                    acao = AssistenteAcao.ORIENTACAO;
                    resposta = resposta + " (Não consegui montar um rascunho de aluno válido.)";
                }
            } else if (acao == AssistenteAcao.RASCUNHO_FICHA) {
                ficha = normalizarFicha(raiz.path("rascunhoFicha"));
                if (ficha == null) {
                    acao = AssistenteAcao.ORIENTACAO;
                    resposta = resposta + " (Não consegui montar um rascunho de ficha válido.)";
                }
            }

            return new AssistenteChatResponse(resposta, acao, aluno, ficha, null);
        } catch (RegraNegocioException ex) {
            throw ex;
        } catch (Exception ex) {
            logger.warn("Resposta Gemini inválida: {}", ex.getMessage());
            return new AssistenteChatResponse(
                    "Recebi uma resposta inconsistente do modelo. Reformule o pedido em uma frase objetiva.",
                    AssistenteAcao.ORIENTACAO,
                    null,
                    null,
                    null
            );
        }
    }

    private List<AssistenteMensagemRequest> lerHistorico(String historicoJson) {
        if (historicoJson == null || historicoJson.isBlank()) {
            return List.of();
        }
        JsonNode raiz;
        try {
            raiz = jsonMapper.readTree(historicoJson);
        } catch (Exception ex) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Não foi possível ler o histórico da conversa.");
        }
        if (!raiz.isArray()) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Não foi possível ler o histórico da conversa.");
        }
        if (raiz.size() > HISTORICO_ENTRADA_MAX) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "O histórico pode ter no máximo 20 mensagens.");
        }
        List<AssistenteMensagemRequest> historico = new ArrayList<>();
        for (JsonNode item : raiz) {
            String mensagem = truncar(texto(item.path("mensagem"), ""), 2000);
            if (mensagem.isBlank()) {
                continue;
            }
            historico.add(new AssistenteMensagemRequest(mensagem, item.path("papel").asText("user")));
        }
        return historico;
    }

    private String normalizarMime(String mimeType) {
        if (mimeType == null) {
            return "";
        }
        String base = mimeType.toLowerCase(Locale.ROOT).trim();
        int separador = base.indexOf(';');
        if (separador >= 0) {
            base = base.substring(0, separador).trim();
        }
        if (base.equals("audio/x-wav") || base.equals("audio/wave")) {
            return "audio/wav";
        }
        return base;
    }

    private String limparTranscricao(String texto) {
        if (texto == null) {
            return "";
        }
        String limpo = texto.trim();
        if ((limpo.startsWith("\"") && limpo.endsWith("\"")) || (limpo.startsWith("“") && limpo.endsWith("”"))) {
            limpo = limpo.substring(1, limpo.length() - 1).trim();
        }
        if (limpo.equalsIgnoreCase("[vazio]") || limpo.equalsIgnoreCase("vazio")) {
            return "";
        }
        return limpo;
    }

    private RascunhoAlunoResponse normalizarAluno(JsonNode no) {
        if (no == null || no.isMissingNode() || no.isNull() || !no.isObject()) {
            return null;
        }
        String nome = limitar(texto(no.path("nome"), ""), 120);
        if (nome.isBlank()) {
            return null;
        }
        String email = limitar(texto(no.path("email"), "").trim().toLowerCase(Locale.ROOT), 180);
        String telefone = limitar(texto(no.path("telefone"), ""), 20);
        String senha = texto(no.path("senha"), "");
        if (senha.length() > 72) {
            senha = senha.substring(0, 72);
        }
        if (!senha.isEmpty() && senha.length() < 8) {
            senha = "";
        }
        Integer idade = inteiro(no.path("idade"), 1, 120, null);
        String profissao = limitar(texto(no.path("profissao"), ""), 120);
        BigDecimal altura = decimal(no.path("alturaM"), new BigDecimal("0.50"), new BigDecimal("2.50"), 2, null);
        BigDecimal peso = decimal(no.path("pesoKg"), BigDecimal.ONE, new BigDecimal("500.0"), 1, null);
        String objetivo = limitar(texto(no.path("objetivo"), ""), 200);
        String observacao = limitar(texto(no.path("observacao"), ""), 2000);
        return new RascunhoAlunoResponse(
                nome, email, telefone, senha, idade, profissao, altura, peso, objetivo, observacao
        );
    }

    private RascunhoFichaResponse normalizarFicha(JsonNode no) {
        if (no == null || no.isMissingNode() || no.isNull() || !no.isObject()) {
            return null;
        }
        String titulo = limitar(texto(no.path("titulo"), ""), 120);
        if (titulo.isBlank()) {
            return null;
        }
        String objetivo = limitar(texto(no.path("objetivo"), ""), 200);
        String observacao = limitar(texto(no.path("observacao"), ""), 2000);
        String inicio = texto(no.path("inicio"), LocalDate.now().toString());
        try {
            LocalDate.parse(inicio);
        } catch (Exception ex) {
            inicio = LocalDate.now().toString();
        }

        JsonNode treinosNo = no.path("treinos");
        if (!treinosNo.isArray() || treinosNo.isEmpty()) {
            return null;
        }

        Set<Integer> diasUsados = new HashSet<>();
        List<RascunhoTreinoResponse> treinos = new ArrayList<>();
        for (JsonNode treinoNo : treinosNo) {
            String nomeTreino = limitar(texto(treinoNo.path("nome"), ""), 80);
            if (nomeTreino.isBlank()) {
                continue;
            }
            String obsTreino = limitar(texto(treinoNo.path("observacao"), ""), 1000);
            List<Integer> dias = new ArrayList<>();
            JsonNode diasNo = treinoNo.path("diasSemana");
            if (diasNo.isArray()) {
                for (JsonNode diaNo : diasNo) {
                    Integer dia = inteiro(diaNo, 0, 6, null);
                    if (dia != null && !diasUsados.contains(dia) && !dias.contains(dia)) {
                        dias.add(dia);
                        diasUsados.add(dia);
                    }
                }
            }

            List<RascunhoExercicioResponse> exercicios = new ArrayList<>();
            JsonNode exerciciosNo = treinoNo.path("exercicios");
            if (exerciciosNo.isArray()) {
                for (JsonNode exercicioNo : exerciciosNo) {
                    String nomeEx = limitar(texto(exercicioNo.path("nome"), ""), 120);
                    if (nomeEx.isBlank()) {
                        continue;
                    }
                    Integer series = inteiro(exercicioNo.path("series"), 1, 99, 3);
                    Integer reps = inteiro(exercicioNo.path("repeticoes"), 1, 999, 10);
                    BigDecimal carga = decimal(
                            exercicioNo.path("cargaKg"),
                            BigDecimal.ZERO,
                            new BigDecimal("9999.9"),
                            1,
                            BigDecimal.ZERO
                    );
                    Integer descanso = inteiro(exercicioNo.path("descansoSegundos"), 1, 3600, 60);
                    String obsEx = limitar(texto(exercicioNo.path("observacao"), ""), 500);
                    exercicios.add(new RascunhoExercicioResponse(nomeEx, series, reps, carga, descanso, obsEx));
                }
            }
            if (exercicios.isEmpty()) {
                continue;
            }
            treinos.add(new RascunhoTreinoResponse(nomeTreino, obsTreino, dias, exercicios));
        }

        if (treinos.isEmpty()) {
            return null;
        }
        return new RascunhoFichaResponse(titulo, objetivo, observacao, inicio, treinos);
    }

    private static AssistenteAcao parseAcao(String valor) {
        try {
            return AssistenteAcao.valueOf(valor.trim().toUpperCase(Locale.ROOT));
        } catch (Exception ex) {
            return AssistenteAcao.ORIENTACAO;
        }
    }

    private static String normalizarPapel(String papel) {
        if (papel != null && papel.equalsIgnoreCase("model")) {
            return "model";
        }
        return "user";
    }

    private static String limparJson(String bruto) {
        String texto = bruto.trim();
        if (texto.startsWith("```")) {
            int inicio = texto.indexOf('{');
            int fim = texto.lastIndexOf('}');
            if (inicio >= 0 && fim > inicio) {
                return texto.substring(inicio, fim + 1);
            }
        }
        return texto;
    }

    private static String texto(JsonNode no, String padrao) {
        if (no == null || no.isMissingNode() || no.isNull()) {
            return padrao;
        }
        if (no.isTextual()) {
            return no.asText();
        }
        if (no.isNumber() || no.isBoolean()) {
            return no.asText();
        }
        return padrao;
    }

    private static String limitar(String valor, int max) {
        String limpo = Textos.limpar(valor);
        if (limpo == null) {
            return "";
        }
        return limpo.length() <= max ? limpo : limpo.substring(0, max);
    }

    private static String truncar(String valor, int max) {
        if (valor == null) {
            return "";
        }
        String trim = valor.trim();
        return trim.length() <= max ? trim : trim.substring(0, max);
    }

    private static String nulo(String valor) {
        return valor == null || valor.isBlank() ? "-" : valor;
    }

    private static Integer inteiro(JsonNode no, int min, int max, Integer padrao) {
        if (no == null || no.isMissingNode() || no.isNull()) {
            return padrao;
        }
        try {
            int valor;
            if (no.isNumber()) {
                valor = no.asInt();
            } else {
                valor = Integer.parseInt(no.asText().trim());
            }
            if (valor < min || valor > max) {
                return padrao;
            }
            return valor;
        } catch (Exception ex) {
            return padrao;
        }
    }

    private static BigDecimal decimal(JsonNode no, BigDecimal min, BigDecimal max, int escala, BigDecimal padrao) {
        if (no == null || no.isMissingNode() || no.isNull()) {
            return padrao;
        }
        try {
            BigDecimal valor;
            if (no.isNumber()) {
                valor = no.decimalValue();
            } else {
                valor = new BigDecimal(no.asText().trim().replace(",", "."));
            }
            valor = valor.setScale(escala, RoundingMode.HALF_UP);
            if (valor.compareTo(min) < 0 || valor.compareTo(max) > 0) {
                return padrao;
            }
            return valor;
        } catch (Exception ex) {
            return padrao;
        }
    }
}
