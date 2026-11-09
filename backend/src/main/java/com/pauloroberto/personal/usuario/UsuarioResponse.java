package com.pauloroberto.personal.usuario;

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
                usuario.getCriadoEm()
        );
    }
}
