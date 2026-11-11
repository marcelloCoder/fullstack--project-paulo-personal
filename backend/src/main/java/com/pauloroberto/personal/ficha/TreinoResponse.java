package com.pauloroberto.personal.ficha;

import java.util.List;

public record TreinoResponse(
        Long id,
        String nome,
        int ordem,
        String observacao,
        List<Integer> diasSemana,
        List<ExercicioResponse> exercicios
) {
}
