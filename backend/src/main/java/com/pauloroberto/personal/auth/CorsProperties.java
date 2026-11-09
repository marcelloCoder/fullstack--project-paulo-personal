package com.pauloroberto.personal.auth;

import jakarta.validation.constraints.NotEmpty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.util.ArrayList;
import java.util.List;

@Validated
@ConfigurationProperties(prefix = "app.cors")
public class CorsProperties {

    @NotEmpty
    private List<String> origens = new ArrayList<>();

    public List<String> getOrigens() {
        return origens;
    }

    public void setOrigens(List<String> origens) {
        this.origens = origens;
    }
}
