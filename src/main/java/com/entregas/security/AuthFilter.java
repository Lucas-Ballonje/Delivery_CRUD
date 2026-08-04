package com.entregas.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Bloqueia o acesso a qualquer rota que nao seja /auth/** sem um token valido.
 * Login (POST /auth/login) devolve o token, que deve ser enviado depois em:
 * Authorization: Bearer <token>
 */
@Component
@Order(2)
public class AuthFilter extends OncePerRequestFilter {

    public static final String USER_ID_ATTR = "authUserId";

    private final TokenStore tokenStore;

    public AuthFilter(TokenStore tokenStore) {
        this.tokenStore = tokenStore;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Preflight de CORS nao manda Authorization; deixa passar sem exigir token.
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        return request.getRequestURI().startsWith("/auth/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        String token = (header != null && header.startsWith("Bearer "))
                ? header.substring("Bearer ".length())
                : null;

        Long userId = (token != null) ? tokenStore.getUserId(token) : null;

        if (userId == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"erro\":\"Token ausente ou invalido. Faca login em POST /auth/login\"}");
            return;
        }

        request.setAttribute(USER_ID_ATTR, userId);
        filterChain.doFilter(request, response);
    }
}
