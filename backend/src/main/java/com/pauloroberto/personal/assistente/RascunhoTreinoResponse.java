package com.pauloroberto.personal.assistente;

import java.util.List;

public record RascunhoTreinoResponse(
        String nome,
        String observacao,
        List<Integer> diasSemana,
        List<RascunhoExercicioResponse> exercicios
) {
}
