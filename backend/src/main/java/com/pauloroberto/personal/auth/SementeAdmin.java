package com.pauloroberto.personal.auth;

import com.pauloroberto.personal.usuario.Papel;
import com.pauloroberto.personal.usuario.Usuario;
import com.pauloroberto.personal.usuario.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class SementeAdmin implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(SementeAdmin.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminProperties adminProperties;

    public SementeAdmin(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            AdminProperties adminProperties
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminProperties = adminProperties;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (usuarioRepository.existsByPapel(Papel.ADMIN)) {
            logger.info("Já existe um administrador. Nenhum outro será criado.");
            return;
        }
        String email = adminProperties.getEmail().trim().toLowerCase(Locale.ROOT);
        if (usuarioRepository.findByEmailIgnoreCase(email).isPresent()) {
            logger.info("O e-mail {} já está em uso. O administrador não foi criado.", email);
            return;
        }
        Usuario admin = new Usuario();
        admin.setNome(adminProperties.getNome().trim());
        admin.setEmail(email);
        admin.setSenhaHash(passwordEncoder.encode(adminProperties.getSenha()));
        admin.setPapel(Papel.ADMIN);
        admin.setAtivo(true);
        usuarioRepository.save(admin);
        logger.info("Admin criado: {}", email);
    }
}
