package com.pauloroberto.personal.ficha;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FichaRepository extends JpaRepository<Ficha, Long> {

    Optional<Ficha> findByAlunoIdAndAtivaTrue(Long alunoId);

    boolean existsByAlunoIdAndAtivaTrue(Long alunoId);

    boolean existsByAlunoId(Long alunoId);

    List<Ficha> findByAlunoIdOrderByInicioDesc(Long alunoId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from Ficha f where f.aluno.id = :alunoId")
    void excluirPorAluno(@Param("alunoId") Long alunoId);
}
