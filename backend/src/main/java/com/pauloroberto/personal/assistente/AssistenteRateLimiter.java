package com.pauloroberto.personal.assistente;

import com.pauloroberto.personal.comum.RegraNegocioException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AssistenteRateLimiter {

    private final GeminiProperties propriedades;
    private final Map<Long, Deque<Instant>> historico = new ConcurrentHashMap<>();

    public AssistenteRateLimiter(GeminiProperties propriedades) {
        this.propriedades = propriedades;
    }

    public void verificar(Long usuarioId) {
        int limite = Math.max(1, propriedades.getRateLimitPorMinuto());
        Instant agora = Instant.now();
        Instant janela = agora.minusSeconds(60);
        Deque<Instant> fila = historico.computeIfAbsent(usuarioId, id -> new ArrayDeque<>());
        synchronized (fila) {
            while (!fila.isEmpty() && fila.peekFirst().isBefore(janela)) {
                fila.removeFirst();
            }
            if (fila.size() >= limite) {
                throw new RegraNegocioException(
                        HttpStatus.TOO_MANY_REQUESTS,
                        "Muitas mensagens em pouco tempo. Aguarde um minuto e tente de novo."
                );
            }
            fila.addLast(agora);
        }
    }
}
