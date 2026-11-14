package com.pauloroberto.personal.agenda;

import java.io.Serializable;
import java.util.Objects;

public class HorarioAgendaId implements Serializable {

    private Integer diaSemana;
    private String horario;

    public HorarioAgendaId() {
    }

    public HorarioAgendaId(Integer diaSemana, String horario) {
        this.diaSemana = diaSemana;
        this.horario = horario;
    }

    public Integer getDiaSemana() {
        return diaSemana;
    }

    public void setDiaSemana(Integer diaSemana) {
        this.diaSemana = diaSemana;
    }

    public String getHorario() {
        return horario;
    }

    public void setHorario(String horario) {
        this.horario = horario;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof HorarioAgendaId that)) {
            return false;
        }
        return Objects.equals(diaSemana, that.diaSemana) && Objects.equals(horario, that.horario);
    }

    @Override
    public int hashCode() {
        return Objects.hash(diaSemana, horario);
    }
}
