package com.pauloroberto.personal.usuario;

import com.pauloroberto.personal.ficha.FichaRepository;
import com.pauloroberto.personal.comum.Medidas;
import com.pauloroberto.personal.comum.RecursoNaoEncontradoException;
import com.pauloroberto.personal.comum.RegraNegocioException;
import com.pauloroberto.personal.comum.Textos;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class AlunoService {

    private static final Logger logger = LoggerFactory.getLogger(AlunoService.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final FichaRepository fichaRepository;

    public AlunoService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            FichaRepository fichaRepository
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.fichaRepository = fichaRepository;
    }

    @Transactional
    public AlunoResponse cadastrar(AlunoCadastroRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (usuarioRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new RegraNegocioException(HttpStatus.CONFLICT, "Este e-mail já está em uso.");
        }
        Usuario aluno = new Usuario();
        aluno.setNome(request.nome().trim());
        aluno.setEmail(email);
        aluno.setSenhaHash(passwordEncoder.encode(request.senha()));
        aluno.setTelefone(Textos.limpar(request.telefone()));
        aluno.setIdade(request.idade());
        aluno.setProfissao(Textos.limpar(request.profissao()));
        aluno.setAlturaM(Medidas.normalizarAltura(request.alturaM()));
        aluno.setPesoKg(Medidas.normalizarPeso(request.pesoKg()));
        aluno.setObjetivo(Textos.limpar(request.objetivo()));
        aluno.setObservacao(Textos.limpar(request.observacao()));
        aluno.setPapel(Papel.ALUNO);
        aluno.setAtivo(false);
        Usuario salvo = usuarioRepository.save(aluno);
        logger.info("Aluno cadastrado pelo administrador: {}", salvo.getEmail());
        return AlunoResponse.de(salvo);
    }

    @Transactional
    public List<AlunoResponse> listar(String busca) {
        String termo = Textos.limpar(busca);
        return usuarioRepository.buscarAlunos(Papel.ALUNO, termo == null ? "" : termo).stream()
                .map(aluno -> AlunoResponse.de(sincronizarAtivoPorFichas(aluno)))
                .toList();
    }

    @Transactional
    public AlunoResponse buscar(Long id) {
        return AlunoResponse.de(sincronizarAtivoPorFichas(carregar(id)));
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
        aluno.setIdade(request.idade());
        aluno.setProfissao(Textos.limpar(request.profissao()));
        aluno.setAlturaM(Medidas.normalizarAltura(request.alturaM()));
        aluno.setPesoKg(Medidas.normalizarPeso(request.pesoKg()));
        aluno.setObjetivo(Textos.limpar(request.objetivo()));
        aluno.setObservacao(Textos.limpar(request.observacao()));
        sincronizarAtivoPorFichas(aluno);
        logger.info("Aluno atualizado: {}", aluno.getId());
        return AlunoResponse.de(aluno);
    }

    @Transactional
    public AlunoResponse alterarAtivo(Long id, boolean ativo) {
        Usuario aluno = sincronizarAtivoPorFichas(carregar(id));
        if (ativo && !aluno.isAtivo()) {
            throw new RegraNegocioException(
                    HttpStatus.BAD_REQUEST,
                    "Cadastre uma ficha para ativar este aluno."
            );
        }
        if (!ativo && aluno.isAtivo()) {
            throw new RegraNegocioException(
                    HttpStatus.BAD_REQUEST,
                    "Alunos com ficha ficam ativos. Remova as fichas para desativar."
            );
        }
        logger.info("Status do aluno {}: {}", aluno.getId(), aluno.isAtivo() ? "ativo" : "desativado");
        return AlunoResponse.de(aluno);
    }

    @Transactional
    public void excluir(Long id) {
        Usuario aluno = carregar(id);
        fichaRepository.excluirPorAluno(aluno.getId());
        usuarioRepository.delete(aluno);
        logger.info("Aluno excluído: {}", aluno.getEmail());
    }

    private Usuario sincronizarAtivoPorFichas(Usuario aluno) {
        boolean temFicha = fichaRepository.existsByAlunoId(aluno.getId());
        if (aluno.isAtivo() != temFicha) {
            aluno.setAtivo(temFicha);
            logger.info(
                    "Status do aluno {} sincronizado: {}",
                    aluno.getId(),
                    temFicha ? "ativo (com ficha)" : "desativado (sem ficha)"
            );
        }
        return aluno;
    }

    private Usuario carregar(Long id) {
        return usuarioRepository.findByIdAndPapel(id, Papel.ALUNO)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aluno não encontrado."));
    }
}
