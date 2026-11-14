package com.pauloroberto.personal.agenda;

import com.pauloroberto.personal.comum.RegraNegocioException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AgendaServiceTest {

    @Mock
    private HorarioAgendaRepository horarioAgendaRepository;

    private AgendaService agendaService;

    @BeforeEach
    void preparar() {
        agendaService = new AgendaService(horarioAgendaRepository);
    }

    @Test
    void listarDisponiveisOmiteIndisponiveis() {
        when(horarioAgendaRepository.findByDisponivelTrueOrderByDiaSemanaAscHorarioAsc())
                .thenReturn(List.of(slot(1, "06:00", true)));

        List<HorarioAgendaResponse> resposta = agendaService.listarDisponiveis();

        assertThat(resposta).hasSize(1);
        assertThat(resposta.getFirst().disponivel()).isTrue();
        assertThat(resposta.getFirst().horario()).isEqualTo("06:00");
    }

    @Test
    void atualizarPersisteFlags() {
        HorarioAgenda segManha = slot(1, "06:00", true);
        HorarioAgenda segTarde = slot(1, "14:00", true);
        when(horarioAgendaRepository.findAll()).thenReturn(new ArrayList<>(List.of(segManha, segTarde)));
        when(horarioAgendaRepository.findAllByOrderByDiaSemanaAscHorarioAsc())
                .thenReturn(List.of(segManha, segTarde));

        List<HorarioAgendaResponse> resposta = agendaService.atualizar(new AgendaAtualizacaoRequest(List.of(
                new HorarioAgendaAtualizacaoRequest(1, "06:00", false),
                new HorarioAgendaAtualizacaoRequest(1, "14:00", true)
        )));

        assertThat(segManha.isDisponivel()).isFalse();
        assertThat(segTarde.isDisponivel()).isTrue();
        verify(horarioAgendaRepository).saveAll(anyList());
        assertThat(resposta).hasSize(2);
    }

    @Test
    void rejeitaSabado() {
        assertThatThrownBy(() -> agendaService.validarSlot(6, "10:00"))
                .isInstanceOf(RegraNegocioException.class)
                .hasMessage("A agenda só aceita segunda a sexta.");
    }

    @Test
    void rejeitaHorarioForaDaGrade() {
        assertThatThrownBy(() -> agendaService.validarSlot(1, "05:30"))
                .isInstanceOf(RegraNegocioException.class)
                .hasMessage("Os horários vão de 06:00 até 21:00.");
    }

    @Test
    void rejeitaIntervaloInvalido() {
        assertThatThrownBy(() -> agendaService.validarSlot(1, "10:15"))
                .isInstanceOf(RegraNegocioException.class)
                .hasMessage("Os horários devem ser de 30 em 30 minutos.");
    }

    @Test
    void rejeitaSlotInexistenteNaGrade() {
        when(horarioAgendaRepository.findAll()).thenReturn(List.of(slot(1, "06:00", true)));

        assertThatThrownBy(() -> agendaService.atualizar(new AgendaAtualizacaoRequest(List.of(
                new HorarioAgendaAtualizacaoRequest(1, "06:30", false)
        ))))
                .isInstanceOf(RegraNegocioException.class)
                .hasMessage("Horário fora da grade semanal permitida.");
    }

    private HorarioAgenda slot(int dia, String horario, boolean disponivel) {
        return new HorarioAgenda(dia, horario, disponivel);
    }
}
