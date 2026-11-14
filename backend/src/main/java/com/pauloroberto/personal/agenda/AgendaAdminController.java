package com.pauloroberto.personal.agenda;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/agenda")
@PreAuthorize("hasRole('ADMIN')")
public class AgendaAdminController {

    private final AgendaService agendaService;

    public AgendaAdminController(AgendaService agendaService) {
        this.agendaService = agendaService;
    }

    @GetMapping
    public List<HorarioAgendaResponse> listar() {
        return agendaService.listarCompleta();
    }

    @PutMapping
    public List<HorarioAgendaResponse> atualizar(@Valid @RequestBody AgendaAtualizacaoRequest request) {
        return agendaService.atualizar(request);
    }
}
