package com.pauloroberto.personal.agenda;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record AgendaAtualizacaoRequest(
        @NotNull(message = "Informe os horários da agenda.")
        @Valid
        List<HorarioAgendaAtualizacaoRequest> horarios
) {
}
