package com.pauloroberto.personal.usuario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmailIgnoreCase(String email);

    boolean existsByPapel(Papel papel);

    Optional<Usuario> findByIdAndPapel(Long id, Papel papel);

    @Query("""
            select u from Usuario u
            where u.papel = :papel
              and (
                :busca = ''
                or lower(u.nome) like lower(concat('%', :busca, '%'))
                or lower(u.email) like lower(concat('%', :busca, '%'))
              )
            order by u.ativo desc, u.nome asc
            """)
    List<Usuario> buscarAlunos(@Param("papel") Papel papel, @Param("busca") String busca);
}
