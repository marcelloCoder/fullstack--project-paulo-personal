package com.pauloroberto.personal.agenda;

public record HorarioAgendaResponse(
        int diaSemana,
        String horario,
        boolean disponivel
) {
}
