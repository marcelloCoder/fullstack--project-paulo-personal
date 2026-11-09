package com.pauloroberto.personal.ficha;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ExercicioRequest(
        @NotBlank(message = "Informe o nome do exercício.")
        @Size(max = 120, message = "O exercício pode ter no máximo 120 caracteres.")
        String nome,
        @NotNull(message = "Informe as séries.")
        @Min(value = 1, message = "As séries começam em 1.")
        @Max(value = 99, message = "As séries vão até 99.")
        Integer series,
        @NotBlank(message = "Informe as repetições.")
        @Size(max = 40, message = "As repetições podem ter no máximo 40 caracteres.")
        String repeticoes,
        @Size(max = 80, message = "A carga pode ter no máximo 80 caracteres.")
        String carga,
        @Size(max = 40, message = "O descanso pode ter no máximo 40 caracteres.")
        String descanso
) {
}
