package com.pauloroberto.personal.assistente;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AssistenteChatRequest(
        @NotBlank(message = "Informe a mensagem.")
        @Size(max = 2000, message = "A mensagem pode ter no máximo 2000 caracteres.")
        String mensagem,
        Long alunoId,
        @Valid
        @Size(max = 20, message = "O histórico pode ter no máximo 20 mensagens.")
        List<AssistenteMensagemRequest> historico
) {
}
