package com.pauloroberto.personal.ficha;

import java.math.BigDecimal;

public record ExercicioResponse(
        Long id,
        int ordem,
        String nome,
        int series,
        int repeticoes,
        BigDecimal cargaKg,
        int descansoSegundos,
        String observacao
) {
}
