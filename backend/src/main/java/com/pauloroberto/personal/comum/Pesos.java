package com.pauloroberto.personal.comum;

import java.math.BigDecimal;

public final class Pesos {

    private Pesos() {
    }

    public static BigDecimal normalizar(BigDecimal peso) {
        return Medidas.normalizarPeso(peso);
    }
}
