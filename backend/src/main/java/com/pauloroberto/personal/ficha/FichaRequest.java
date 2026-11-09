package com.pauloroberto.personal.ficha;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record FichaRequest(
        @NotBlank(message = "Informe o título da ficha.")
        @Size(max = 120, message = "O título pode ter no máximo 120 caracteres.")
        String titulo,
        @Size(max = 200, message = "O objetivo pode ter no máximo 200 caracteres.")
        String objetivo,
        @Size(max = 2000, message = "A observação pode ter no máximo 2000 caracteres.")
        String observacao,
        @NotNull(message = "Informe a data de início.")
        LocalDate inicio,
        @NotNull(message = "Informe os treinos.")
        @Valid
        List<TreinoRequest> treinos
) {
}
