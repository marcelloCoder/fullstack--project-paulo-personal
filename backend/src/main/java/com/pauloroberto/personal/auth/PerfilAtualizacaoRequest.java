package com.pauloroberto.personal.auth;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record PerfilAtualizacaoRequest(
        @NotBlank(message = "Informe o nome.")
        @Size(max = 120, message = "O nome pode ter no máximo 120 caracteres.")
        String nome,
        @NotBlank(message = "Informe o e-mail.")
        @Email(message = "E-mail inválido.")
        @Size(max = 180, message = "O e-mail pode ter no máximo 180 caracteres.")
        String email,
        @Size(max = 20, message = "O telefone pode ter no máximo 20 caracteres.")
        String telefone,
        @Min(value = 1, message = "A idade precisa ser de pelo menos 1 ano.")
        @Max(value = 120, message = "A idade pode ser de no máximo 120 anos.")
        Integer idade,
        @Size(max = 120, message = "A profissão pode ter no máximo 120 caracteres.")
        String profissao,
        @DecimalMin(value = "0.50", message = "A altura precisa ser de pelo menos 0,50 m.")
        @DecimalMax(value = "2.50", message = "A altura pode ser de no máximo 2,50 m.")
        @Digits(integer = 1, fraction = 2, message = "Informe a altura em metros com no máximo duas casas decimais.")
        BigDecimal alturaM,
        @DecimalMin(value = "1.0", message = "O peso precisa ser de pelo menos 1 kg.")
        @DecimalMax(value = "500.0", message = "O peso pode ser de no máximo 500 kg.")
        @Digits(integer = 3, fraction = 1, message = "Informe o peso em kg com no máximo uma casa decimal.")
        BigDecimal pesoKg,
        @Size(max = 200, message = "O objetivo pode ter no máximo 200 caracteres.")
        String objetivo
) {
}
