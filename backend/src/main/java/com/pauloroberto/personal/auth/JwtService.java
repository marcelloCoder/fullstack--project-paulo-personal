package com.pauloroberto.personal.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final SegurancaProperties propriedades;
    private final SecretKey chave;

    public JwtService(SegurancaProperties propriedades) {
        if (propriedades.getJwtSegredo() == null
                || propriedades.getJwtSegredo().getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SEGREDO precisa ter pelo menos 32 bytes.");
        }
        this.propriedades = propriedades;
        this.chave = Keys.hmacShaKeyFor(propriedades.getJwtSegredo().getBytes(StandardCharsets.UTF_8));
    }

    public String gerar(Long usuarioId) {
        Instant agora = Instant.now();
        return Jwts.builder()
                .subject(usuarioId.toString())
                .issuedAt(Date.from(agora))
                .expiration(Date.from(agora.plus(propriedades.getJwtExpiracao())))
                .signWith(chave)
                .compact();
    }

    public Long lerUsuarioId(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(chave)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Long.valueOf(claims.getSubject());
        } catch (JwtException | IllegalArgumentException ex) {
            throw new JwtException("Token inválido.");
        }
    }
}
