package com.pauloroberto.personal.auth;

import com.pauloroberto.personal.usuario.Papel;
import com.pauloroberto.personal.usuario.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SementeAdminTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private SementeAdmin sementeAdmin;

    @BeforeEach
    void preparar() {
        AdminProperties propriedades = new AdminProperties();
        propriedades.setNome("Paulo Roberto");
        propriedades.setEmail("paulo@personal.local");
        propriedades.setSenha("senha-de-teste");
        sementeAdmin = new SementeAdmin(usuarioRepository, passwordEncoder, propriedades);
    }

    @Test
    void naoCriaOutroAdministradorQuandoJaExisteUm() {
        when(usuarioRepository.existsByPapel(Papel.ADMIN)).thenReturn(true);

        sementeAdmin.run(new DefaultApplicationArguments(new String[0]));

        verify(usuarioRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }
}
