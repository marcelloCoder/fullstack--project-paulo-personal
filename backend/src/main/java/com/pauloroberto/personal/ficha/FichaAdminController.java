package com.pauloroberto.personal.ficha;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class FichaAdminController {

    private final FichaService fichaService;

    public FichaAdminController(FichaService fichaService) {
        this.fichaService = fichaService;
    }

    @GetMapping("/alunos/{alunoId}/fichas")
    public List<FichaResponse> listar(@PathVariable Long alunoId) {
        return fichaService.listarDoAluno(alunoId);
    }

    @PostMapping("/alunos/{alunoId}/fichas")
    public ResponseEntity<FichaResponse> criar(@PathVariable Long alunoId, @Valid @RequestBody FichaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(fichaService.criar(alunoId, request));
    }

    @PutMapping("/fichas/{id}")
    public FichaResponse atualizar(@PathVariable Long id, @Valid @RequestBody FichaRequest request) {
        return fichaService.atualizar(id, request);
    }

    @PatchMapping("/fichas/{id}/ativar")
    public FichaResponse ativar(@PathVariable Long id) {
        return fichaService.ativar(id);
    }
}
