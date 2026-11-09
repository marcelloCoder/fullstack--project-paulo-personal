package com.pauloroberto.personal.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SenhaAtualizacaoRequest(
        @NotBlank(message = "Informe a senha atual.")
        String senhaAtual,
        @NotBlank(message = "Informe a nova senha.")
        @Size(min = 8, max = 72, message = "A nova senha precisa ter entre 8 e 72 caracteres.")
        String senhaNova
) {
}
