package com.pauloroberto.personal.ficha;

public record ExercicioResponse(
        Long id,
        int ordem,
        String nome,
        int series,
        String repeticoes,
        String carga,
        String descanso
) {
}
