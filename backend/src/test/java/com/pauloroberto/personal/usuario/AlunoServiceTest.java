package com.pauloroberto.personal.usuario;

import com.pauloroberto.personal.comum.RecursoNaoEncontradoException;
import com.pauloroberto.personal.comum.RegraNegocioException;
import com.pauloroberto.personal.ficha.FichaRepository;
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
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AlunoServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private FichaRepository fichaRepository;

    private AlunoService alunoService;

    @BeforeEach
    void preparar() {
        alunoService = new AlunoService(usuarioRepository, passwordEncoder, fichaRepository);
    }

    @Test
    void administradorCadastraAlunoComSenhaCodificada() {
        when(usuarioRepository.findByEmailIgnoreCase("bia@teste.local")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("senha1234")).thenReturn("hash");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocacao -> {
            Usuario usuario = invocacao.getArgument(0);
            usuario.setId(3L);
            return usuario;
        });

        AlunoResponse resposta = alunoService.cadastrar(new AlunoCadastroRequest(
                "Bia",
                "Bia@teste.local",
                "senha1234",
                "35999999999",
                32,
                "Enfermeira",
                new BigDecimal("1.68"),
                new BigDecimal("65.5"),
                "Condicionamento",
                null
        ));

        assertThat(resposta.email()).isEqualTo("bia@teste.local");
        assertThat(resposta.ativo()).isFalse();
        assertThat(resposta.idade()).isEqualTo(32);
        assertThat(resposta.profissao()).isEqualTo("Enfermeira");
        assertThat(resposta.alturaM()).isEqualByComparingTo("1.68");
        assertThat(resposta.pesoKg()).isEqualByComparingTo("65.5");
        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(captor.capture());
        assertThat(captor.getValue().getPapel()).isEqualTo(Papel.ALUNO);
        assertThat(captor.getValue().getSenhaHash()).isEqualTo("hash");
        assertThat(captor.getValue().getObjetivo()).isEqualTo("Condicionamento");
        assertThat(captor.getValue().getIdade()).isEqualTo(32);
        assertThat(captor.getValue().getProfissao()).isEqualTo("Enfermeira");
        assertThat(captor.getValue().getAlturaM()).isEqualByComparingTo("1.68");
        assertThat(captor.getValue().getPesoKg()).isEqualByComparingTo("65.5");
    }

    @Test
    void sincronizaStatusConformeFichasDoAluno() {
        Usuario aluno = new Usuario();
        aluno.setId(2L);
        aluno.setNome("Ana");
        aluno.setEmail("ana@teste.local");
        aluno.setPapel(Papel.ALUNO);
        aluno.setAtivo(true);
        when(usuarioRepository.findByIdAndPapel(2L, Papel.ALUNO)).thenReturn(Optional.of(aluno));
        when(fichaRepository.existsByAlunoId(2L)).thenReturn(false);

        AlunoResponse resposta = alunoService.alterarAtivo(2L, false);

        assertThat(resposta.ativo()).isFalse();
        assertThat(aluno.isAtivo()).isFalse();
        assertThat(aluno.getNome()).isEqualTo("Ana");
        assertThat(aluno.getEmail()).isEqualTo("ana@teste.local");
    }

    @Test
    void recusaAtivarAlunoSemFicha() {
        Usuario aluno = new Usuario();
        aluno.setId(2L);
        aluno.setPapel(Papel.ALUNO);
        aluno.setAtivo(false);
        when(usuarioRepository.findByIdAndPapel(2L, Papel.ALUNO)).thenReturn(Optional.of(aluno));
        when(fichaRepository.existsByAlunoId(2L)).thenReturn(false);

        assertThatThrownBy(() -> alunoService.alterarAtivo(2L, true)).isInstanceOf(RegraNegocioException.class);
    }

    @Test
    void recusaEmailJaUsado() {
        when(usuarioRepository.findByEmailIgnoreCase("ana@teste.local")).thenReturn(Optional.of(new Usuario()));

        assertThatThrownBy(() -> alunoService.cadastrar(new AlunoCadastroRequest(
                "Ana",
                "ana@teste.local",
                "senha1234",
                "35999999999",
                28,
                "Professora",
                new BigDecimal("1.65"),
                new BigDecimal("72.5"),
                "Ganho de massa",
                null
        ))).isInstanceOf(RegraNegocioException.class);
    }

    @Test
    void excluiAlunoEAsFichas() {
        Usuario aluno = new Usuario();
        aluno.setId(2L);
        aluno.setEmail("ana@teste.local");
        aluno.setPapel(Papel.ALUNO);
        when(usuarioRepository.findByIdAndPapel(2L, Papel.ALUNO)).thenReturn(Optional.of(aluno));

        alunoService.excluir(2L);

        verify(fichaRepository).excluirPorAluno(2L);
        verify(usuarioRepository).delete(aluno);
    }

    @Test
    void naoExcluiQuemNaoEAluno() {
        when(usuarioRepository.findByIdAndPapel(1L, Papel.ALUNO)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> alunoService.excluir(1L)).isInstanceOf(RecursoNaoEncontradoException.class);
        verify(usuarioRepository, never()).delete(any());
    }
}
