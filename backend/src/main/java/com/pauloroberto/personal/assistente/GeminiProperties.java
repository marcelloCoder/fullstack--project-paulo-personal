package com.pauloroberto.personal.assistente;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.gemini")
public class GeminiProperties {

    private String apiKey = "";
    private String model = "gemini-3.5-flash";
    private int rateLimitPorMinuto = 20;

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public int getRateLimitPorMinuto() {
        return rateLimitPorMinuto;
    }

    public void setRateLimitPorMinuto(int rateLimitPorMinuto) {
        this.rateLimitPorMinuto = rateLimitPorMinuto;
    }

    public boolean configurado() {
        return apiKey != null && !apiKey.isBlank();
    }
}
