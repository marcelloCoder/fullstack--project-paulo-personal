package com.pauloroberto.personal.ficha;

import com.pauloroberto.personal.usuario.Papel;
import com.pauloroberto.personal.usuario.Usuario;
import com.pauloroberto.personal.usuario.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.postgresql.PostgreSQLContainer;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class FichaRepositoryTest {

    static final PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17-alpine");

    static {
        postgres.start();
    }

    @DynamicPropertySource
    static void propriedades(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private FichaRepository fichaRepository;

    @Test
    void alunoSoEnxergaAPropriaFichaAtiva() {
        Usuario ana = salvarAluno("Ana", "ana@test.local");
        Usuario bia = salvarAluno("Bia", "bia@test.local");
        Ficha ativaDaAna = salvarFicha(ana, "Atual", true);
        salvarFicha(ana, "Antiga", false);
        salvarFicha(bia, "Da Bia", true);

        assertThat(fichaRepository.findByAlunoIdAndAtivaTrue(ana.getId()))
                .get()
                .extracting(Ficha::getId)
                .isEqualTo(ativaDaAna.getId());
        assertThat(fichaRepository.findByAlunoIdAndAtivaTrue(bia.getId()))
                .get()
                .extracting(Ficha::getAluno)
                .extracting(Usuario::getId)
                .isEqualTo(bia.getId());
    }

    private Usuario salvarAluno(String nome, String email) {
        Usuario aluno = new Usuario();
        aluno.setNome(nome);
        aluno.setEmail(email);
        aluno.setSenhaHash("hash");
        aluno.setPapel(Papel.ALUNO);
        aluno.setAtivo(true);
        return usuarioRepository.save(aluno);
    }

    private Ficha salvarFicha(Usuario aluno, String titulo, boolean ativa) {
        Ficha ficha = new Ficha();
        ficha.setAluno(aluno);
        ficha.setTitulo(titulo);
        ficha.setInicio(LocalDate.of(2026, 11, 9));
        ficha.setAtiva(ativa);
        Treino treino = new Treino();
        treino.setNome("Treino A");
        treino.setOrdem(0);
        Exercicio exercicio = new Exercicio();
        exercicio.setOrdem(0);
        exercicio.setNome("Agachamento");
        exercicio.setSeries(3);
        exercicio.setRepeticoes("10");
        treino.adicionarExercicio(exercicio);
        ficha.adicionarTreino(treino);
        return fichaRepository.save(ficha);
    }
}
