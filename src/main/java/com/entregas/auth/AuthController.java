package com.entregas.auth;

import com.entregas.auth.dto.CadastroRequest;
import com.entregas.auth.dto.LoginRequest;
import com.entregas.model.User;
import com.entregas.repository.UserRepository;
import com.entregas.security.TokenStore;
import com.entregas.util.PasswordUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final TokenStore tokenStore;

    public AuthController(UserRepository userRepository, TokenStore tokenStore) {
        this.userRepository = userRepository;
        this.tokenStore = tokenStore;
    }

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrar(@RequestBody CadastroRequest req) {
        if (isBlank(req.getNome()) || isBlank(req.getEmail()) || isBlank(req.getSenha())) {
            return erro(HttpStatus.BAD_REQUEST, "nome, email e senha sao obrigatorios");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            return erro(HttpStatus.CONFLICT, "ja existe um usuario com esse email");
        }

        User user = new User(req.getNome(), req.getEmail(), PasswordUtil.hash(req.getSenha()));
        user = userRepository.save(user);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("id", user.getId());
        body.put("nome", user.getNome());
        body.put("email", user.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        if (isBlank(req.getEmail()) || isBlank(req.getSenha())) {
            return erro(HttpStatus.BAD_REQUEST, "email e senha sao obrigatorios");
        }

        User user = userRepository.findByEmail(req.getEmail()).orElse(null);
        if (user == null || !PasswordUtil.matches(req.getSenha(), user.getSenhaHash())) {
            return erro(HttpStatus.UNAUTHORIZED, "email ou senha invalidos");
        }

        String token = tokenStore.gerarToken(user.getId());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("token", token);
        body.put("usuario", Map.of("id", user.getId(), "nome", user.getNome(), "email", user.getEmail()));
        return ResponseEntity.ok(body);
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private ResponseEntity<?> erro(HttpStatus status, String mensagem) {
        return ResponseEntity.status(status).body(Map.of("erro", mensagem));
    }
}
