package com.pauloroberto.personal.assistente;

public record AssistenteChatResponse(
        String resposta,
        AssistenteAcao acao,
        RascunhoAlunoResponse rascunhoAluno,
        RascunhoFichaResponse rascunhoFicha,
        String transcricao
) {
}
