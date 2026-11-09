package com.pauloroberto.personal.ficha;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record TreinoRequest(
        @NotBlank(message = "Informe o nome do treino.")
        @Size(max = 80, message = "O treino pode ter no máximo 80 caracteres.")
        String nome,
        @Size(max = 1000, message = "A observação do treino pode ter no máximo 1000 caracteres.")
        String observacao,
        @NotNull(message = "Informe os exercícios do treino.")
        @Valid
        List<ExercicioRequest> exercicios
) {
}
