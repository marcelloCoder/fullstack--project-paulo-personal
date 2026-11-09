package com.pauloroberto.personal.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CadastroRequest(
        @NotBlank(message = "Informe o nome.")
        @Size(max = 120, message = "O nome pode ter no máximo 120 caracteres.")
        String nome,
        @NotBlank(message = "Informe o e-mail.")
        @Email(message = "E-mail inválido.")
        @Size(max = 180, message = "O e-mail pode ter no máximo 180 caracteres.")
        String email,
        @NotBlank(message = "Informe a senha.")
        @Size(min = 8, max = 72, message = "A senha precisa ter entre 8 e 72 caracteres.")
        String senha,
        @Size(max = 20, message = "O telefone pode ter no máximo 20 caracteres.")
        String telefone
) {
}
