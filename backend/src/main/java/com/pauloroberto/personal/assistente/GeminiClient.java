package com.pauloroberto.personal.assistente;

import com.pauloroberto.personal.comum.RegraNegocioException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

import java.util.Base64;
import java.util.List;

@Component
public class GeminiClient {

    private static final Logger logger = LoggerFactory.getLogger(GeminiClient.class);
    private static final String BASE = "https://generativelanguage.googleapis.com/v1beta/models/";

    private final GeminiProperties propriedades;
    private final JsonMapper jsonMapper;
    private final RestClient restClient;

    public GeminiClient(GeminiProperties propriedades, JsonMapper jsonMapper) {
        this.propriedades = propriedades;
        this.jsonMapper = jsonMapper;
        this.restClient = RestClient.builder().build();
    }

    public String gerar(String systemPrompt, List<Conteudo> historico) {
        if (!propriedades.configurado()) {
            throw new RegraNegocioException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Assistente indisponível. Configure GEMINI_API_KEY no servidor."
            );
        }

        ObjectNode corpo = jsonMapper.createObjectNode();
        ObjectNode systemInstruction = corpo.putObject("system_instruction");
        ArrayNode systemParts = systemInstruction.putArray("parts");
        systemParts.addObject().put("text", systemPrompt);

        ArrayNode contents = corpo.putArray("contents");
        for (Conteudo item : historico) {
            ObjectNode content = contents.addObject();
            content.put("role", item.role());
            content.putArray("parts").addObject().put("text", item.text());
        }

        ObjectNode generationConfig = corpo.putObject("generationConfig");
        generationConfig.put("responseMimeType", "application/json");
        generationConfig.put("temperature", 0.6);

        return extrairTexto(chamar(corpo));
    }

    public String transcrever(byte[] audio, String mimeType) {
        if (!propriedades.configurado()) {
            throw new RegraNegocioException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Assistente indisponível. Configure GEMINI_API_KEY no servidor."
            );
        }

        ObjectNode corpo = jsonMapper.createObjectNode();
        ObjectNode content = corpo.putArray("contents").addObject();
        content.put("role", "user");
        ArrayNode parts = content.putArray("parts");
        parts.addObject().put(
                "text",
                "Transcreva fielmente o áudio a seguir em português brasileiro. "
                        + "Responda somente com as palavras faladas, sem comentários, aspas ou formatação. "
                        + "Se não houver fala compreensível, responda exatamente: [vazio]"
        );
        ObjectNode inline = parts.addObject().putObject("inline_data");
        inline.put("mime_type", mimeType);
        inline.put("data", Base64.getEncoder().encodeToString(audio));

        ObjectNode generationConfig = corpo.putObject("generationConfig");
        generationConfig.put("temperature", 0);

        return extrairTexto(chamar(corpo));
    }

    private String chamar(ObjectNode corpo) {
        String url = BASE + propriedades.getModel() + ":generateContent?key=" + propriedades.getApiKey();
        try {
            return restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(corpo)
                    .retrieve()
                    .body(String.class);
        } catch (RestClientResponseException ex) {
            logger.warn("Gemini respondeu {} — {}", ex.getStatusCode().value(), ex.getResponseBodyAsString());
            if (ex.getStatusCode().value() == 429) {
                throw new RegraNegocioException(
                        HttpStatus.TOO_MANY_REQUESTS,
                        "O limite gratuito do Gemini foi atingido. Tente de novo em instantes."
                );
            }
            throw new RegraNegocioException(
                    HttpStatus.BAD_GATEWAY,
                    "Não foi possível falar com o assistente agora. Tente de novo."
            );
        } catch (RegraNegocioException ex) {
            throw ex;
        } catch (Exception ex) {
            logger.error("Falha ao chamar Gemini", ex);
            throw new RegraNegocioException(
                    HttpStatus.BAD_GATEWAY,
                    "Não foi possível falar com o assistente agora. Tente de novo."
            );
        }
    }

    private String extrairTexto(String respostaBruta) {
        if (respostaBruta == null || respostaBruta.isBlank()) {
            throw new RegraNegocioException(HttpStatus.BAD_GATEWAY, "O assistente não retornou conteúdo.");
        }
        JsonNode raiz = jsonMapper.readTree(respostaBruta);
        JsonNode texto = raiz.path("candidates").path(0).path("content").path("parts").path(0).path("text");
        if (!texto.isTextual() || texto.asText().isBlank()) {
            throw new RegraNegocioException(HttpStatus.BAD_GATEWAY, "O assistente não retornou conteúdo útil.");
        }
        return texto.asText();
    }

    public record Conteudo(String role, String text) {
    }
}
