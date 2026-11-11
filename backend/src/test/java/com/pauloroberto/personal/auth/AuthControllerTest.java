package com.pauloroberto.personal.auth;

import com.pauloroberto.personal.usuario.Papel;
import com.pauloroberto.personal.usuario.UsuarioRepository;
import com.pauloroberto.personal.usuario.UsuarioResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import({SecurityConfig.class, JwtFiltro.class, JwtService.class, CookieService.class})
@EnableConfigurationProperties({SegurancaProperties.class, CorsProperties.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private UsuarioRepository usuarioRepository;

    @Test
    void loginGravaCookieHttpOnly() throws Exception {
        when(authService.autenticar(any())).thenReturn(
                new UsuarioResponse(1L, "Ana", "ana@test.local", null, Papel.ALUNO, null, null, true, null, null, null, null, null)
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"ana@test.local\",\"senha\":\"senha1234\"}"))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("sessao"))
                .andExpect(cookie().httpOnly("sessao", true))
                .andExpect(jsonPath("$.papel").value("ALUNO"));
    }

    @Test
    void fichaSemLoginResponde401() throws Exception {
        mockMvc.perform(get("/api/me/ficha"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.mensagem").value("Faça login para continuar."));
    }
}
