package com.pauloroberto.personal.auth;

import com.pauloroberto.personal.usuario.Usuario;
import com.pauloroberto.personal.usuario.UsuarioRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class JwtFiltro extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtFiltro.class);

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final SegurancaProperties propriedades;

    public JwtFiltro(JwtService jwtService, UsuarioRepository usuarioRepository, SegurancaProperties propriedades) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
        this.propriedades = propriedades;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            String token = lerCookie(request);
            if (token != null) {
                autenticar(token);
            }
        }
        filterChain.doFilter(request, response);
    }

    private void autenticar(String token) {
        try {
            Long usuarioId = jwtService.lerUsuarioId(token);
            Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
            if (usuario == null || !usuario.isAtivo()) {
                return;
            }
            var autenticacao = new UsernamePasswordAuthenticationToken(
                    usuario,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getPapel().name()))
            );
            SecurityContextHolder.getContext().setAuthentication(autenticacao);
        } catch (JwtException ex) {
            logger.debug("Token recusado: {}", ex.getMessage());
        }
    }

    private String lerCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (propriedades.getCookieNome().equals(cookie.getName()) && !cookie.getValue().isBlank()) {
                return java.net.URLDecoder.decode(cookie.getValue(), StandardCharsets.UTF_8);
            }
        }
        return null;
    }

    static void escreverJson(HttpServletResponse response, int status, String mensagem) throws IOException {
        response.setStatus(status);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setHeader(HttpHeaders.CONTENT_TYPE, "application/json");
        response.getWriter().write("{\"status\":" + status + ",\"mensagem\":\"" + mensagem + "\",\"erros\":[]}");
    }
}
