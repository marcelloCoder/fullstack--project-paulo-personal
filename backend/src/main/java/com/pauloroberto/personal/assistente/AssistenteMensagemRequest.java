package com.pauloroberto.personal.assistente;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AssistenteMensagemRequest(
        @NotBlank(message = "Informe a mensagem.")
        @Size(max = 2000, message = "A mensagem pode ter no máximo 2000 caracteres.")
        String mensagem,
        String papel
) {
}
