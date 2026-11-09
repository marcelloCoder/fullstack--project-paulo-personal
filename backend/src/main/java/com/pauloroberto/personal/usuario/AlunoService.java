package com.pauloroberto.personal.usuario;

import com.pauloroberto.personal.comum.RecursoNaoEncontradoException;
import com.pauloroberto.personal.comum.RegraNegocioException;
import com.pauloroberto.personal.comum.Textos;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class AlunoService {

    private static final Logger logger = LoggerFactory.getLogger(AlunoService.class);

    private final UsuarioRepository usuarioRepository;

    public AlunoService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<AlunoResponse> listar(String busca) {
        String termo = Textos.limpar(busca);
        return usuarioRepository.buscarAlunos(Papel.ALUNO, termo == null ? "" : termo).stream()
                .map(AlunoResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public AlunoResponse buscar(Long id) {
        return AlunoResponse.de(carregar(id));
    }

    @Transactional
    public AlunoResponse atualizar(Long id, AlunoAtualizacaoRequest request) {
        Usuario aluno = carregar(id);
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        usuarioRepository.findByEmailIgnoreCase(email).ifPresent(outro -> {
            if (!outro.getId().equals(aluno.getId())) {
                throw new RegraNegocioException(HttpStatus.CONFLICT, "Este e-mail já está em uso.");
            }
        });
        aluno.setNome(request.nome().trim());
        aluno.setEmail(email);
        aluno.setTelefone(Textos.limpar(request.telefone()));
        aluno.setAtivo(request.ativo());
        aluno.setObjetivo(Textos.limpar(request.objetivo()));
        aluno.setObservacao(Textos.limpar(request.observacao()));
        logger.info("Aluno atualizado: {}", aluno.getId());
        return AlunoResponse.de(aluno);
    }

    private Usuario carregar(Long id) {
        return usuarioRepository.findByIdAndPapel(id, Papel.ALUNO)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aluno não encontrado."));
    }
}
