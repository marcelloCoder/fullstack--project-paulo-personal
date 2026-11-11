package com.pauloroberto.personal.usuario;

import jakarta.validation.constraints.NotNull;

public record AlunoStatusRequest(
        @NotNull(message = "Informe se o aluno está ativo.")
        Boolean ativo
) {
}
