package com.pauloroberto.personal.auth;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

@Validated
@ConfigurationProperties(prefix = "app.seguranca")
public class SegurancaProperties {

    @NotBlank
    private String jwtSegredo;

    private Duration jwtExpiracao = Duration.ofHours(12);

    @NotBlank
    private String cookieNome;

    private boolean cookieSecure;

    public String getJwtSegredo() {
        return jwtSegredo;
    }

    public void setJwtSegredo(String jwtSegredo) {
        this.jwtSegredo = jwtSegredo;
    }

    public Duration getJwtExpiracao() {
        return jwtExpiracao;
    }

    public void setJwtExpiracao(Duration jwtExpiracao) {
        this.jwtExpiracao = jwtExpiracao;
    }

    public String getCookieNome() {
        return cookieNome;
    }

    public void setCookieNome(String cookieNome) {
        this.cookieNome = cookieNome;
    }

    public boolean isCookieSecure() {
        return cookieSecure;
    }

    public void setCookieSecure(boolean cookieSecure) {
        this.cookieSecure = cookieSecure;
    }
}
