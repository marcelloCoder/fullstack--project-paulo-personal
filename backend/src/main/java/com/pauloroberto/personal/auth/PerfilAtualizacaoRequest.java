package com.pauloroberto.personal.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PerfilAtualizacaoRequest(
        @NotBlank(message = "Informe o nome.")
        @Size(max = 120, message = "O nome pode ter no máximo 120 caracteres.")
        String nome,
        @NotBlank(message = "Informe o e-mail.")
        @Email(message = "E-mail inválido.")
        @Size(max = 180, message = "O e-mail pode ter no máximo 180 caracteres.")
        String email,
        @Size(max = 20, message = "O telefone pode ter no máximo 20 caracteres.")
        String telefone,
        @Size(max = 200, message = "O objetivo pode ter no máximo 200 caracteres.")
        String objetivo
) {
}
