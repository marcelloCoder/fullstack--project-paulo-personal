package com.pauloroberto.personal.assistente;

import java.util.List;

public record RascunhoFichaResponse(
        String titulo,
        String objetivo,
        String observacao,
        String inicio,
        List<RascunhoTreinoResponse> treinos
) {
}
