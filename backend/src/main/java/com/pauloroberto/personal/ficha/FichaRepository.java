package com.pauloroberto.personal.ficha;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FichaRepository extends JpaRepository<Ficha, Long> {

    Optional<Ficha> findByAlunoIdAndAtivaTrue(Long alunoId);

    boolean existsByAlunoIdAndAtivaTrue(Long alunoId);

    List<Ficha> findByAlunoIdOrderByInicioDesc(Long alunoId);
}
