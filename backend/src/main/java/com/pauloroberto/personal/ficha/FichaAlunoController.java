package com.pauloroberto.personal.ficha;

import com.pauloroberto.personal.comum.CredenciaisInvalidasException;
import com.pauloroberto.personal.usuario.Usuario;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me/ficha")
public class FichaAlunoController {

    private final FichaService fichaService;

    public FichaAlunoController(FichaService fichaService) {
        this.fichaService = fichaService;
    }

    @GetMapping
    public FichaResponse minha(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof Usuario usuario) {
            return fichaService.buscarAtiva(usuario.getId());
        }
        throw new CredenciaisInvalidasException("Faça login para continuar.");
    }
}
