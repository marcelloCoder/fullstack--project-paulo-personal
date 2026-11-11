package com.pauloroberto.personal.ficha;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ExercicioRequest(
        @NotBlank(message = "Informe o nome do exercício.")
        @Size(max = 120, message = "O exercício pode ter no máximo 120 caracteres.")
        String nome,
        @NotNull(message = "Informe as séries.")
        @Min(value = 1, message = "As séries devem ser um número inteiro a partir de 1.")
        @Max(value = 99, message = "As séries vão até 99.")
        Integer series,
        @NotNull(message = "Informe as repetições.")
        @Min(value = 1, message = "As repetições devem ser um número inteiro a partir de 1.")
        @Max(value = 999, message = "As repetições vão até 999.")
        Integer repeticoes,
        @NotNull(message = "Informe a carga em kg.")
        @DecimalMin(value = "0.0", inclusive = true, message = "A carga em kg não pode ser negativa.")
        BigDecimal cargaKg,
        @NotNull(message = "Informe o descanso em segundos.")
        @Min(value = 1, message = "O descanso deve ser um número inteiro de segundos a partir de 1.")
        @Max(value = 3600, message = "O descanso pode ter no máximo 3600 segundos.")
        Integer descansoSegundos,
        @Size(max = 500, message = "A observação pode ter no máximo 500 caracteres.")
        String observacao
) {
}
