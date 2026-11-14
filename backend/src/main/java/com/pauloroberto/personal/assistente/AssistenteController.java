package com.pauloroberto.personal.assistente;

import com.pauloroberto.personal.comum.RegraNegocioException;
import com.pauloroberto.personal.usuario.Usuario;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/admin/assistente")
@PreAuthorize("hasRole('ADMIN')")
public class AssistenteController {

    private final AssistenteService assistenteService;

    public AssistenteController(AssistenteService assistenteService) {
        this.assistenteService = assistenteService;
    }

    @PostMapping("/chat")
    public AssistenteChatResponse chat(
            Authentication authentication,
            @Valid @RequestBody AssistenteChatRequest request
    ) {
        Usuario admin = atual(authentication);
        return assistenteService.conversar(admin.getId(), request);
    }

    @PostMapping(value = "/voz", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AssistenteChatResponse voz(
            Authentication authentication,
            @RequestPart(value = "audio", required = false) MultipartFile audio,
            @RequestParam(value = "alunoId", required = false) Long alunoId,
            @RequestParam(value = "historico", required = false) String historico
    ) {
        Usuario admin = atual(authentication);
        if (audio == null || audio.isEmpty()) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Envie um áudio para o assistente.");
        }
        try {
            return assistenteService.ouvir(
                    admin.getId(),
                    audio.getBytes(),
                    audio.getContentType(),
                    alunoId,
                    historico
            );
        } catch (IOException ex) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Não foi possível ler o áudio.");
        }
    }

    private Usuario atual(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof Usuario usuario) {
            return usuario;
        }
        throw new RegraNegocioException(HttpStatus.UNAUTHORIZED, "Faça login para continuar.");
    }
}
