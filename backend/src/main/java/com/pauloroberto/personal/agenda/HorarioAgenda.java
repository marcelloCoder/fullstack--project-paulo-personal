package com.pauloroberto.personal.agenda;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "horario_agenda")
@IdClass(HorarioAgendaId.class)
public class HorarioAgenda {

    @Id
    @Column(name = "dia_semana", nullable = false)
    private Integer diaSemana;

    @Id
    @Column(nullable = false, length = 5)
    private String horario;

    @Column(nullable = false)
    private boolean disponivel;

    public HorarioAgenda(Integer diaSemana, String horario, boolean disponivel) {
        this.diaSemana = diaSemana;
        this.horario = horario;
        this.disponivel = disponivel;
    }
}
