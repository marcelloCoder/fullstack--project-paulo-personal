package com.pauloroberto.personal.auth;

import com.pauloroberto.personal.comum.CredenciaisInvalidasException;
import com.pauloroberto.personal.usuario.Usuario;
import com.pauloroberto.personal.usuario.UsuarioResponse;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final CookieService cookieService;

    public AuthController(AuthService authService, JwtService jwtService, CookieService cookieService) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.cookieService = cookieService;
    }

    @PostMapping("/register")
    public ResponseEntity<UsuarioResponse> cadastrar(
            @Valid @RequestBody CadastroRequest request,
            HttpServletResponse response
    ) {
        UsuarioResponse usuario = authService.cadastrar(request);
        escreverCookie(response, jwtService.gerar(usuario.id()));
        return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
    }

    @PostMapping("/login")
    public UsuarioResponse entrar(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        UsuarioResponse usuario = authService.autenticar(request);
        escreverCookie(response, jwtService.gerar(usuario.id()));
        return usuario;
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> sair(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, cookieService.limpar().toString());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public UsuarioResponse eu(Authentication authentication) {
        return UsuarioResponse.de(atual(authentication));
    }

    private void escreverCookie(HttpServletResponse response, String token) {
        response.addHeader(HttpHeaders.SET_COOKIE, cookieService.criar(token).toString());
    }

    private Usuario atual(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof Usuario usuario) {
            return usuario;
        }
        throw new CredenciaisInvalidasException("Faça login para continuar.");
    }
}
