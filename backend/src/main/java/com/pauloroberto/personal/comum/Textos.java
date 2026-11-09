package com.pauloroberto.personal.comum;

public final class Textos {

    private Textos() {
    }

    public static String limpar(String valor) {
        if (valor == null) {
            return null;
        }
        String texto = valor.trim();
        return texto.isEmpty() ? null : texto;
    }
}
