package com.pauloroberto.personal.assistente;

import java.math.BigDecimal;

public record RascunhoExercicioResponse(
        String nome,
        Integer series,
        Integer repeticoes,
        BigDecimal cargaKg,
        Integer descansoSegundos,
        String observacao
) {
}
