package com.pauloroberto.personal.usuario;

import java.math.BigDecimal;
import java.time.Instant;

public record UsuarioResponse(
        Long id,
        String nome,
        String email,
        String telefone,
        Papel papel,
        String objetivo,
        String observacao,
        boolean ativo,
        Integer idade,
        String profissao,
        BigDecimal alturaM,
        BigDecimal pesoKg,
        Instant criadoEm
) {

    public static UsuarioResponse de(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTelefone(),
                usuario.getPapel(),
                usuario.getObjetivo(),
                usuario.getObservacao(),
                usuario.isAtivo(),
                usuario.getIdade(),
                usuario.getProfissao(),
                usuario.getAlturaM(),
                usuario.getPesoKg(),
                usuario.getCriadoEm()
        );
    }
}
