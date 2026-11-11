package com.pauloroberto.personal.ficha;

import java.util.List;

final class DiasSemana {

    static final List<String> NOMES = List.of(
            "domingo",
            "segunda-feira",
            "terça-feira",
            "quarta-feira",
            "quinta-feira",
            "sexta-feira",
            "sábado"
    );

    private DiasSemana() {
    }

    static String nome(int dia) {
        if (dia < 0 || dia > 6) {
            return "dia inválido";
        }
        return NOMES.get(dia);
    }
}
