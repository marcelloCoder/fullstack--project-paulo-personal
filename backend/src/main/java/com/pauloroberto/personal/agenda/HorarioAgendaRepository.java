package com.pauloroberto.personal.agenda;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HorarioAgendaRepository extends JpaRepository<HorarioAgenda, HorarioAgendaId> {

    List<HorarioAgenda> findByDisponivelTrueOrderByDiaSemanaAscHorarioAsc();

    List<HorarioAgenda> findAllByOrderByDiaSemanaAscHorarioAsc();
}
