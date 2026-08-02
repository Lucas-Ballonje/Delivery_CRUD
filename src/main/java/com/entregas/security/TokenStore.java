package com.entregas.security;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Guarda os tokens de sessao em memoria (token -> id do usuario).
 * Simples de proposito: sem JWT, sem tabela de sessao no banco.
 * Os tokens somem quando a aplicacao reinicia (usuario so precisa logar de novo).
 */
@Component
public class TokenStore {

    private final Map<String, Long> tokens = new ConcurrentHashMap<>();

    public String gerarToken(Long userId) {
        String token = UUID.randomUUID().toString();
        tokens.put(token, userId);
        return token;
    }

    public Long getUserId(String token) {
        return tokens.get(token);
    }
}
