package com.pauloroberto.personal.usuario;

import java.math.BigDecimal;
import java.time.Instant;

public record AlunoResponse(
        Long id,
        String nome,
        String email,
        String telefone,
        boolean ativo,
        String objetivo,
        String observacao,
        Integer idade,
        String profissao,
        BigDecimal alturaM,
        BigDecimal pesoKg,
        Instant criadoEm
) {

    public static AlunoResponse de(Usuario usuario) {
        return new AlunoResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTelefone(),
                usuario.isAtivo(),
                usuario.getObjetivo(),
                usuario.getObservacao(),
                usuario.getIdade(),
                usuario.getProfissao(),
                usuario.getAlturaM(),
                usuario.getPesoKg(),
                usuario.getCriadoEm()
        );
    }
}
