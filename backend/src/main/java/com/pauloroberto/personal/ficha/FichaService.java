package com.pauloroberto.personal.ficha;

import com.pauloroberto.personal.comum.RecursoNaoEncontradoException;
import com.pauloroberto.personal.comum.Textos;
import com.pauloroberto.personal.usuario.Papel;
import com.pauloroberto.personal.usuario.Usuario;
import com.pauloroberto.personal.usuario.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FichaService {

    private static final Logger logger = LoggerFactory.getLogger(FichaService.class);
    private static final String SEM_FICHA = "Você ainda não tem uma ficha ativa. Fale com o Paulo.";

    private final FichaRepository fichaRepository;
    private final UsuarioRepository usuarioRepository;

    public FichaService(FichaRepository fichaRepository, UsuarioRepository usuarioRepository) {
        this.fichaRepository = fichaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public FichaResponse buscarAtiva(Long alunoId) {
        return fichaRepository.findByAlunoIdAndAtivaTrue(alunoId)
                .map(this::mapear)
                .orElseThrow(() -> new RecursoNaoEncontradoException(SEM_FICHA));
    }

    @Transactional(readOnly = true)
    public List<FichaResponse> listarDoAluno(Long alunoId) {
        garantirAluno(alunoId);
        return fichaRepository.findByAlunoIdOrderByInicioDesc(alunoId).stream()
                .map(this::mapear)
                .toList();
    }

    @Transactional
    public FichaResponse criar(Long alunoId, FichaRequest request) {
        Usuario aluno = garantirAluno(alunoId);
        Ficha ficha = new Ficha();
        ficha.setAluno(aluno);
        ficha.setAtiva(false);
        aplicar(ficha, request);
        if (!fichaRepository.existsByAlunoIdAndAtivaTrue(alunoId)) {
            ficha.setAtiva(true);
        }
        Ficha salva = fichaRepository.saveAndFlush(ficha);
        logger.info("Ficha {} criada para o aluno {}", salva.getId(), alunoId);
        return mapear(salva);
    }

    @Transactional
    public FichaResponse atualizar(Long id, FichaRequest request) {
        Ficha ficha = carregar(id);
        aplicar(ficha, request);
        Ficha salva = fichaRepository.saveAndFlush(ficha);
        logger.info("Ficha {} atualizada", salva.getId());
        return mapear(salva);
    }

    @Transactional
    public FichaResponse ativar(Long id) {
        Ficha escolhida = carregar(id);
        List<Ficha> fichas = fichaRepository.findByAlunoIdOrderByInicioDesc(escolhida.getAluno().getId());
        fichas.forEach(ficha -> ficha.setAtiva(false));
        fichaRepository.flush();
        escolhida.setAtiva(true);
        logger.info("Ficha {} ativada para o aluno {}", escolhida.getId(), escolhida.getAluno().getId());
        return mapear(escolhida);
    }

    private Usuario garantirAluno(Long alunoId) {
        return usuarioRepository.findByIdAndPapel(alunoId, Papel.ALUNO)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aluno não encontrado."));
    }

    private Ficha carregar(Long id) {
        return fichaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Ficha não encontrada."));
    }

    private void aplicar(Ficha ficha, FichaRequest request) {
        ficha.setTitulo(request.titulo().trim());
        ficha.setObjetivo(Textos.limpar(request.objetivo()));
        ficha.setObservacao(Textos.limpar(request.observacao()));
        ficha.setInicio(request.inicio());
        ficha.limparTreinos();
        List<TreinoRequest> treinos = request.treinos();
        for (int i = 0; i < treinos.size(); i++) {
            TreinoRequest treinoRequest = treinos.get(i);
            Treino treino = new Treino();
            treino.setNome(treinoRequest.nome().trim());
            treino.setOrdem(i);
            treino.setObservacao(Textos.limpar(treinoRequest.observacao()));
            List<ExercicioRequest> exercicios = treinoRequest.exercicios();
            for (int j = 0; j < exercicios.size(); j++) {
                ExercicioRequest exercicioRequest = exercicios.get(j);
                Exercicio exercicio = new Exercicio();
                exercicio.setOrdem(j);
                exercicio.setNome(exercicioRequest.nome().trim());
                exercicio.setSeries(exercicioRequest.series());
                exercicio.setRepeticoes(exercicioRequest.repeticoes().trim());
                exercicio.setCarga(Textos.limpar(exercicioRequest.carga()));
                exercicio.setDescanso(Textos.limpar(exercicioRequest.descanso()));
                treino.adicionarExercicio(exercicio);
            }
            ficha.adicionarTreino(treino);
        }
    }

    private FichaResponse mapear(Ficha ficha) {
        List<TreinoResponse> treinos = ficha.getTreinos().stream()
                .map(treino -> new TreinoResponse(
                        treino.getId(),
                        treino.getNome(),
                        treino.getOrdem(),
                        treino.getObservacao(),
                        treino.getExercicios().stream()
                                .map(exercicio -> new ExercicioResponse(
                                        exercicio.getId(),
                                        exercicio.getOrdem(),
                                        exercicio.getNome(),
                                        exercicio.getSeries(),
                                        exercicio.getRepeticoes(),
                                        exercicio.getCarga(),
                                        exercicio.getDescanso()
                                ))
                                .toList()
                ))
                .toList();
        return new FichaResponse(
                ficha.getId(),
                ficha.getAluno().getId(),
                ficha.getTitulo(),
                ficha.getObjetivo(),
                ficha.getObservacao(),
                ficha.getInicio(),
                ficha.isAtiva(),
                treinos
        );
    }
}
