package com.pauloroberto.personal.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AlunoAtualizacaoRequest(
        @NotBlank(message = "Informe o nome.")
        @Size(max = 120, message = "O nome pode ter no máximo 120 caracteres.")
        String nome,
        @NotBlank(message = "Informe o e-mail.")
        @Email(message = "E-mail inválido.")
        @Size(max = 180, message = "O e-mail pode ter no máximo 180 caracteres.")
        String email,
        @Size(max = 20, message = "O telefone pode ter no máximo 20 caracteres.")
        String telefone,
        @NotNull(message = "Informe se o aluno está ativo.")
        Boolean ativo,
        @Size(max = 200, message = "O objetivo pode ter no máximo 200 caracteres.")
        String objetivo,
        @Size(max = 2000, message = "A observação pode ter no máximo 2000 caracteres.")
        String observacao
) {
}
