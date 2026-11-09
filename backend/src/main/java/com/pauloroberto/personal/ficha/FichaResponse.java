package com.pauloroberto.personal.ficha;

import java.time.LocalDate;
import java.util.List;

public record FichaResponse(
        Long id,
        Long alunoId,
        String titulo,
        String objetivo,
        String observacao,
        LocalDate inicio,
        boolean ativa,
        List<TreinoResponse> treinos
) {
}
