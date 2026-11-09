package com.pauloroberto.personal.auth;

import com.pauloroberto.personal.comum.CredenciaisInvalidasException;
import com.pauloroberto.personal.comum.RegraNegocioException;
import com.pauloroberto.personal.comum.Textos;
import com.pauloroberto.personal.usuario.Papel;
import com.pauloroberto.personal.usuario.Usuario;
import com.pauloroberto.personal.usuario.UsuarioRepository;
import com.pauloroberto.personal.usuario.UsuarioResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UsuarioResponse cadastrar(CadastroRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (usuarioRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new RegraNegocioException(HttpStatus.CONFLICT, "Este e-mail já está em uso.");
        }
        Usuario usuario = new Usuario();
        usuario.setNome(request.nome().trim());
        usuario.setEmail(email);
        usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
        usuario.setTelefone(Textos.limpar(request.telefone()));
        usuario.setPapel(Papel.ALUNO);
        usuario.setAtivo(true);
        Usuario salvo = usuarioRepository.save(usuario);
        logger.info("Aluno cadastrado: {}", salvo.getEmail());
        return UsuarioResponse.de(salvo);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse autenticar(LoginRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new CredenciaisInvalidasException("E-mail ou senha inválidos."));
        if (!usuario.isAtivo()) {
            throw new CredenciaisInvalidasException("Sua conta está desativada. Fale com o Paulo.");
        }
        if (!passwordEncoder.matches(request.senha(), usuario.getSenhaHash())) {
            throw new CredenciaisInvalidasException("E-mail ou senha inválidos.");
        }
        logger.info("Login de {}", usuario.getEmail());
        return UsuarioResponse.de(usuario);
    }
}
