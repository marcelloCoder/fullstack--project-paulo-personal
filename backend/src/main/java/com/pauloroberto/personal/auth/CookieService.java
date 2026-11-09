package com.pauloroberto.personal.auth;

import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

@Service
public class CookieService {

    private final SegurancaProperties propriedades;

    public CookieService(SegurancaProperties propriedades) {
        this.propriedades = propriedades;
    }

    public ResponseCookie criar(String token) {
        return base(token).maxAge(propriedades.getJwtExpiracao()).build();
    }

    public ResponseCookie limpar() {
        return base("").maxAge(0).build();
    }

    private ResponseCookie.ResponseCookieBuilder base(String valor) {
        return ResponseCookie.from(propriedades.getCookieNome(), valor)
                .httpOnly(true)
                .secure(propriedades.isCookieSecure())
                .path("/")
                .sameSite("Lax");
    }
}
