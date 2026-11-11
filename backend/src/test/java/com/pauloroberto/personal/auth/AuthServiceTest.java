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

import java.math.BigDecimal;
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
                new CadastroRequest(
                        "Ana",
                        "Ana@Test.local",
                        "senha1234",
                        "35999999999",
                        28,
                        "Professora",
                        new BigDecimal("1.65"),
                        new BigDecimal("72.5"),
                        "Ganho de massa"
                )
        );

        assertThat(resposta.email()).isEqualTo("ana@test.local");
        assertThat(resposta.papel()).isEqualTo(Papel.ALUNO);
        assertThat(resposta.idade()).isEqualTo(28);
        assertThat(resposta.profissao()).isEqualTo("Professora");
        assertThat(resposta.alturaM()).isEqualByComparingTo("1.65");
        assertThat(resposta.pesoKg()).isEqualByComparingTo("72.5");
        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(captor.capture());
        assertThat(captor.getValue().getSenhaHash()).isEqualTo("hash");
        assertThat(captor.getValue().isAtivo()).isFalse();
        assertThat(captor.getValue().getPapel()).isEqualTo(Papel.ALUNO);
    }

    @Test
    void recusaEmailDuplicado() {
        when(usuarioRepository.findByEmailIgnoreCase("ana@test.local")).thenReturn(Optional.of(new Usuario()));

        assertThatThrownBy(() -> authService.cadastrar(
                new CadastroRequest(
                        "Ana",
                        "ana@test.local",
                        "senha1234",
                        "35999999999",
                        28,
                        "Professora",
                        new BigDecimal("1.65"),
                        new BigDecimal("72.5"),
                        "Ganho de massa"
                )
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

    @Test
    void alunoAtualizaProprioPerfilSemTrocarPapel() {
        Usuario usuario = alunoAtivo();
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.findByEmailIgnoreCase("ana@test.local")).thenReturn(Optional.of(usuario));

        UsuarioResponse resposta = authService.atualizarPerfil(
                1L,
                new PerfilAtualizacaoRequest(
                        "Ana Souza",
                        "ana@test.local",
                        "35988887777",
                        29,
                        "Advogada",
                        new BigDecimal("1.66"),
                        new BigDecimal("68"),
                        "Ganhar força"
                )
        );

        assertThat(resposta.nome()).isEqualTo("Ana Souza");
        assertThat(resposta.telefone()).isEqualTo("35988887777");
        assertThat(resposta.objetivo()).isEqualTo("Ganhar força");
        assertThat(resposta.idade()).isEqualTo(29);
        assertThat(resposta.profissao()).isEqualTo("Advogada");
        assertThat(resposta.alturaM()).isEqualByComparingTo("1.66");
        assertThat(resposta.pesoKg()).isEqualByComparingTo("68.0");
        assertThat(usuario.getPapel()).isEqualTo(Papel.ALUNO);
    }

    @Test
    void recusaEmailDeOutraConta() {
        Usuario usuario = alunoAtivo();
        Usuario outro = new Usuario();
        outro.setId(2L);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.findByEmailIgnoreCase("paulo@personal.local")).thenReturn(Optional.of(outro));

        assertThatThrownBy(() -> authService.atualizarPerfil(
                1L,
                new PerfilAtualizacaoRequest("Ana", "paulo@personal.local", null, null, null, null, null, null)
        )).isInstanceOf(RegraNegocioException.class);
    }

    @Test
    void administradorNaoGravaObjetivoDeAluno() {
        Usuario admin = alunoAtivo();
        admin.setPapel(Papel.ADMIN);
        admin.setObjetivo(null);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(usuarioRepository.findByEmailIgnoreCase("ana@test.local")).thenReturn(Optional.of(admin));

        authService.atualizarPerfil(
                1L,
                new PerfilAtualizacaoRequest(
                        "Paulo",
                        "ana@test.local",
                        null,
                        40,
                        "Personal",
                        new BigDecimal("1.80"),
                        new BigDecimal("80"),
                        "Ignorar"
                )
        );

        assertThat(admin.getObjetivo()).isNull();
        assertThat(admin.getIdade()).isNull();
        assertThat(admin.getProfissao()).isNull();
        assertThat(admin.getAlturaM()).isNull();
        assertThat(admin.getPesoKg()).isNull();
        assertThat(admin.getPapel()).isEqualTo(Papel.ADMIN);
    }

    @Test
    void recusaSenhaAtualIncorreta() {
        Usuario usuario = alunoAtivo();
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("errada", "hash")).thenReturn(false);

        assertThatThrownBy(() -> authService.alterarSenha(1L, new SenhaAtualizacaoRequest("errada", "senha-nova")))
                .isInstanceOf(RegraNegocioException.class)
                .hasMessage("A senha atual não confere.");
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
