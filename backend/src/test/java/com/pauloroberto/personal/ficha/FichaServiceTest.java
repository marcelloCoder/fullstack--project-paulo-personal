package com.pauloroberto.personal.ficha;

import com.pauloroberto.personal.comum.RecursoNaoEncontradoException;
import com.pauloroberto.personal.comum.RegraNegocioException;
import com.pauloroberto.personal.usuario.Papel;
import com.pauloroberto.personal.usuario.Usuario;
import com.pauloroberto.personal.usuario.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FichaServiceTest {

    @Mock
    private FichaRepository fichaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    private FichaService fichaService;

    @BeforeEach
    void preparar() {
        fichaService = new FichaService(fichaRepository, usuarioRepository);
    }

    @Test
    void avisaQuandoOAlunoNaoTemFichaAtiva() {
        when(fichaRepository.findByAlunoIdAndAtivaTrue(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> fichaService.buscarAtiva(1L))
                .isInstanceOf(RecursoNaoEncontradoException.class)
                .hasMessage("Você ainda não tem uma ficha ativa. Fale com o Paulo.");
    }

    @Test
    void primeiraFichaDoAlunoNasceAtiva() {
        Usuario aluno = aluno();
        when(usuarioRepository.findByIdAndPapel(5L, Papel.ALUNO)).thenReturn(Optional.of(aluno));
        when(fichaRepository.existsByAlunoIdAndAtivaTrue(5L)).thenReturn(false);
        when(fichaRepository.saveAndFlush(any(Ficha.class))).thenAnswer(invocacao -> {
            Ficha ficha = invocacao.getArgument(0);
            ficha.setId(10L);
            return ficha;
        });

        FichaResponse resposta = fichaService.criar(5L, pedido());

        assertThat(resposta.ativa()).isTrue();
        assertThat(aluno.isAtivo()).isTrue();
        assertThat(resposta.titulo()).isEqualTo("Hipertrofia");
        assertThat(resposta.treinos()).hasSize(1);
        assertThat(resposta.treinos().getFirst().exercicios()).hasSize(1);
    }

    @Test
    void fichaNovaFicaInativaQuandoJaExisteUmaAtiva() {
        when(usuarioRepository.findByIdAndPapel(5L, Papel.ALUNO)).thenReturn(Optional.of(aluno()));
        when(fichaRepository.existsByAlunoIdAndAtivaTrue(5L)).thenReturn(true);
        when(fichaRepository.saveAndFlush(any(Ficha.class))).thenAnswer(invocacao -> invocacao.getArgument(0));

        FichaResponse resposta = fichaService.criar(5L, pedido());

        assertThat(resposta.ativa()).isFalse();
    }

    @Test
    void ativarDesligaAsOutrasFichasDoMesmoAluno() {
        Usuario aluno = aluno();
        Ficha antiga = ficha(2L, aluno, true);
        Ficha nova = ficha(3L, aluno, false);
        when(fichaRepository.findById(3L)).thenReturn(Optional.of(nova));
        when(fichaRepository.findByAlunoIdOrderByInicioDesc(5L)).thenReturn(List.of(antiga, nova));

        FichaResponse resposta = fichaService.ativar(3L);

        assertThat(resposta.ativa()).isTrue();
        assertThat(antiga.isAtiva()).isFalse();
        verify(fichaRepository).flush();
    }

    @Test
    void excluirFichaAtivaAtivaOutraEMantemAlunoAtivo() {
        Usuario aluno = aluno();
        aluno.setAtivo(true);
        Ficha ativa = ficha(2L, aluno, true);
        Ficha outra = ficha(3L, aluno, false);
        when(fichaRepository.findById(2L)).thenReturn(Optional.of(ativa));
        when(fichaRepository.findByAlunoIdOrderByInicioDesc(5L)).thenReturn(List.of(outra));
        when(fichaRepository.existsByAlunoId(5L)).thenReturn(true);

        fichaService.excluir(2L);

        verify(fichaRepository).delete(ativa);
        assertThat(outra.isAtiva()).isTrue();
        assertThat(aluno.isAtivo()).isTrue();
    }

    @Test
    void excluirUltimaFichaDesativaAluno() {
        Usuario aluno = aluno();
        aluno.setAtivo(true);
        Ficha unica = ficha(2L, aluno, true);
        when(fichaRepository.findById(2L)).thenReturn(Optional.of(unica));
        when(fichaRepository.findByAlunoIdOrderByInicioDesc(5L)).thenReturn(List.of());
        when(fichaRepository.existsByAlunoId(5L)).thenReturn(false);

        fichaService.excluir(2L);

        verify(fichaRepository).delete(unica);
        assertThat(aluno.isAtivo()).isFalse();
    }

    @Test
    void rejeitaDoisTreinosNoMesmoDia() {
        when(usuarioRepository.findByIdAndPapel(5L, Papel.ALUNO)).thenReturn(Optional.of(aluno()));

        FichaRequest pedido = new FichaRequest(
                "Hipertrofia",
                "Ganho",
                null,
                LocalDate.of(2026, 11, 9),
                List.of(
                        new TreinoRequest(
                                "Peito",
                                null,
                                List.of(1),
                                List.of(new ExercicioRequest("Supino", 4, 10, new BigDecimal("20"), 90, null))
                        ),
                        new TreinoRequest(
                                "Costas",
                                null,
                                List.of(1),
                                List.of(new ExercicioRequest("Remada", 4, 10, new BigDecimal("20"), 90, null))
                        )
                )
        );

        assertThatThrownBy(() -> fichaService.criar(5L, pedido))
                .isInstanceOf(RegraNegocioException.class)
                .hasMessage("O dia segunda-feira já está atribuído a outro treino.");
    }

    private Usuario aluno() {
        Usuario aluno = new Usuario();
        aluno.setId(5L);
        aluno.setPapel(Papel.ALUNO);
        aluno.setNome("Ana");
        return aluno;
    }

    private Ficha ficha(Long id, Usuario aluno, boolean ativa) {
        Ficha ficha = new Ficha();
        ficha.setId(id);
        ficha.setAluno(aluno);
        ficha.setAtiva(ativa);
        ficha.setTitulo("Ficha " + id);
        ficha.setInicio(LocalDate.of(2026, 11, 9));
        return ficha;
    }

    private FichaRequest pedido() {
        return new FichaRequest(
                "Hipertrofia",
                "Ganho",
                "  ",
                LocalDate.of(2026, 11, 9),
                List.of(new TreinoRequest(
                        "Treino A",
                        null,
                        List.of(1),
                        List.of(new ExercicioRequest("Supino", 4, 10, new BigDecimal("20"), 90, "Controle a descida"))
                ))
        );
    }
}
