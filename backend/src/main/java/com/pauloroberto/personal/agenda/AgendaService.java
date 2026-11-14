package com.pauloroberto.personal.agenda;

import com.pauloroberto.personal.comum.RegraNegocioException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class AgendaService {

    private static final Logger logger = LoggerFactory.getLogger(AgendaService.class);
    private static final DateTimeFormatter FORMATO = DateTimeFormatter.ofPattern("HH:mm");
    static final LocalTime HORARIO_INICIO = LocalTime.of(6, 0);
    static final LocalTime HORARIO_FIM = LocalTime.of(21, 0);

    private final HorarioAgendaRepository horarioAgendaRepository;

    public AgendaService(HorarioAgendaRepository horarioAgendaRepository) {
        this.horarioAgendaRepository = horarioAgendaRepository;
    }

    @Transactional(readOnly = true)
    public List<HorarioAgendaResponse> listarDisponiveis() {
        return horarioAgendaRepository.findByDisponivelTrueOrderByDiaSemanaAscHorarioAsc().stream()
                .map(this::mapear)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<HorarioAgendaResponse> listarCompleta() {
        return horarioAgendaRepository.findAllByOrderByDiaSemanaAscHorarioAsc().stream()
                .map(this::mapear)
                .toList();
    }

    @Transactional
    public List<HorarioAgendaResponse> atualizar(AgendaAtualizacaoRequest request) {
        if (request.horarios() == null || request.horarios().isEmpty()) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Informe os horários da agenda.");
        }

        Map<HorarioAgendaId, HorarioAgenda> existentes = new HashMap<>();
        for (HorarioAgenda slot : horarioAgendaRepository.findAll()) {
            existentes.put(new HorarioAgendaId(slot.getDiaSemana(), slot.getHorario()), slot);
        }

        Set<HorarioAgendaId> vistos = new HashSet<>();
        List<HorarioAgenda> paraSalvar = new ArrayList<>();

        for (HorarioAgendaAtualizacaoRequest item : request.horarios()) {
            String horario = normalizarHorario(item.horario());
            validarSlot(item.diaSemana(), horario);
            HorarioAgendaId id = new HorarioAgendaId(item.diaSemana(), horario);
            if (!vistos.add(id)) {
                throw new RegraNegocioException(
                        HttpStatus.BAD_REQUEST,
                        "Há horários duplicados na agenda enviada."
                );
            }
            HorarioAgenda slot = existentes.get(id);
            if (slot == null) {
                throw new RegraNegocioException(
                        HttpStatus.BAD_REQUEST,
                        "Horário fora da grade semanal permitida."
                );
            }
            slot.setDisponivel(Boolean.TRUE.equals(item.disponivel()));
            paraSalvar.add(slot);
        }

        horarioAgendaRepository.saveAll(paraSalvar);
        logger.info("Agenda semanal atualizada: {} slots alterados", paraSalvar.size());
        return listarCompleta();
    }

    void validarSlot(Integer diaSemana, String horarioTexto) {
        if (diaSemana == null || diaSemana < 1 || diaSemana > 5) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "A agenda só aceita segunda a sexta.");
        }
        LocalTime horario = parseHorario(horarioTexto);
        if (horario.isBefore(HORARIO_INICIO) || horario.isAfter(HORARIO_FIM)) {
            throw new RegraNegocioException(
                    HttpStatus.BAD_REQUEST,
                    "Os horários vão de 06:00 até 21:00."
            );
        }
        int minuto = horario.getMinute();
        if (minuto != 0 && minuto != 30) {
            throw new RegraNegocioException(
                    HttpStatus.BAD_REQUEST,
                    "Os horários devem ser de 30 em 30 minutos."
            );
        }
    }

    private String normalizarHorario(String horario) {
        return parseHorario(horario).format(FORMATO);
    }

    private LocalTime parseHorario(String horario) {
        if (horario == null || horario.isBlank()) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Informe o horário.");
        }
        String limpo = horario.trim();
        if (limpo.length() > 5) {
            limpo = limpo.substring(0, 5);
        }
        try {
            return LocalTime.parse(limpo, FORMATO);
        } catch (DateTimeParseException ex) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Horário inválido.");
        }
    }

    private HorarioAgendaResponse mapear(HorarioAgenda slot) {
        return new HorarioAgendaResponse(slot.getDiaSemana(), slot.getHorario(), slot.isDisponivel());
    }
}
