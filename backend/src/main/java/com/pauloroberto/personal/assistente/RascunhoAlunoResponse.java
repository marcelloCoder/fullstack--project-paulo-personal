package com.pauloroberto.personal.assistente;

import java.math.BigDecimal;

public record RascunhoAlunoResponse(
        String nome,
        String email,
        String telefone,
        String senha,
        Integer idade,
        String profissao,
        BigDecimal alturaM,
        BigDecimal pesoKg,
        String objetivo,
        String observacao
) {
}
