package com.pauloroberto.personal.comum;

import java.util.List;

public record ErroResponse(int status, String mensagem, List<String> erros) {

    public static ErroResponse de(int status, String mensagem) {
        return new ErroResponse(status, mensagem, List.of());
    }
}
