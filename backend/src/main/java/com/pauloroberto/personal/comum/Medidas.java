package com.pauloroberto.personal.comum;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class Medidas {

    private Medidas() {
    }

    public static BigDecimal normalizarPeso(BigDecimal peso) {
        if (peso == null) {
            return null;
        }
        return peso.setScale(1, RoundingMode.HALF_UP);
    }

    public static BigDecimal normalizarAltura(BigDecimal altura) {
        if (altura == null) {
            return null;
        }
        return altura.setScale(2, RoundingMode.HALF_UP);
    }
}
