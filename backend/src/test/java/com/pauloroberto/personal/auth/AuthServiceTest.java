package com.pauloroberto.personal.auth;

import com.pauloroberto.personal.comum.CredenciaisInvalidasException;
import com.pauloroberto.personal.comum.RegraNegocioException;
import com.pauloroberto.personal.usuario.Papel;
import com.pauloroberto.personal.usuario.Usuario;
import com.pauloroberto.personal.usuario.UsuarioRepository;
import com.pauloroberto.personal.usuario.UsuarioResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private AuthService authService;

    @BeforeEach
    void preparar() {
        authService = new AuthService(usuarioRepository, passwordEncoder);
    }

    @Test
    void cadastraAlunoComSenhaCodificada() {
        when(usuarioRepository.findByEmailIgnoreCase("ana@test.local")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("senha1234")).thenReturn("hash");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocacao -> {
            Usuario usuario = invocacao.getArgument(0);
            usuario.setId(1L);
            return usuario;
        });

        UsuarioResponse resposta = authService.cadastrar(
                new CadastroRequest("Ana", "Ana@Test.local", "senha1234", "35999999999")
        );

        assertThat(resposta.email()).isEqualTo("ana@test.local");
        assertThat(resposta.papel()).isEqualTo(Papel.ALUNO);
        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(captor.capture());
        assertThat(captor.getValue().getSenhaHash()).isEqualTo("hash");
        assertThat(captor.getValue().isAtivo()).isTrue();
        assertThat(captor.getValue().getPapel()).isEqualTo(Papel.ALUNO);
    }

    @Test
    void recusaEmailDuplicado() {
        when(usuarioRepository.findByEmailIgnoreCase("ana@test.local")).thenReturn(Optional.of(new Usuario()));

        assertThatThrownBy(() -> authService.cadastrar(
                new CadastroRequest("Ana", "ana@test.local", "senha1234", null)
        )).isInstanceOf(RegraNegocioException.class);
    }

    @Test
    void recusaSenhaIncorreta() {
        Usuario usuario = alunoAtivo();
        when(usuarioRepository.findByEmailIgnoreCase("ana@test.local")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("senha1234", "hash")).thenReturn(false);

        assertThatThrownBy(() -> authService.autenticar(new LoginRequest("ana@test.local", "senha1234")))
                .isInstanceOf(CredenciaisInvalidasException.class)
                .hasMessage("E-mail ou senha inválidos.");
    }

    @Test
    void recusaAlunoDesativado() {
        Usuario usuario = alunoAtivo();
        usuario.setAtivo(false);
        when(usuarioRepository.findByEmailIgnoreCase("ana@test.local")).thenReturn(Optional.of(usuario));

        assertThatThrownBy(() -> authService.autenticar(new LoginRequest("ana@test.local", "senha1234")))
                .isInstanceOf(CredenciaisInvalidasException.class)
                .hasMessage("Sua conta está desativada. Fale com o Paulo.");
    }

    private Usuario alunoAtivo() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setNome("Ana");
        usuario.setEmail("ana@test.local");
        usuario.setSenhaHash("hash");
        usuario.setPapel(Papel.ALUNO);
        usuario.setAtivo(true);
        return usuario;
    }
}
