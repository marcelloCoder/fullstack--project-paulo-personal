package com.pauloroberto.personal.agenda;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record HorarioAgendaAtualizacaoRequest(
        @NotNull(message = "Informe o dia da semana.")
        @Min(value = 1, message = "A agenda só aceita segunda a sexta.")
        @Max(value = 5, message = "A agenda só aceita segunda a sexta.")
        Integer diaSemana,
        @NotBlank(message = "Informe o horário.")
        @Size(max = 5, message = "Horário inválido.")
        @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "Horário inválido.")
        String horario,
        @NotNull(message = "Informe se o horário está disponível.")
        Boolean disponivel
) {
}
