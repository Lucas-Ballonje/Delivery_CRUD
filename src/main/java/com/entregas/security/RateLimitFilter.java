package com.entregas.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limit simples por IP: janela fixa em memoria (sem biblioteca externa).
 * A cada "windowSeconds", o contador do IP zera.
 * Se o IP estourar "maxRequests" dentro da janela, responde 429.
 * Roda ANTES do AuthFilter (Order 1) para tambem proteger /auth/login e /auth/cadastro.
 */
@Component
@Order(1)
public class RateLimitFilter extends OncePerRequestFilter {

    @Value("${ratelimit.max-requests:20}")
    private int maxRequests;

    @Value("${ratelimit.window-seconds:60}")
    private int windowSeconds;

    private final Map<String, Contador> contadoresPorIp = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String ip = request.getRemoteAddr();
        Contador contador = contadoresPorIp.computeIfAbsent(ip, k -> new Contador());

        if (!contador.permitir(windowSeconds, maxRequests)) {
            response.setStatus(429); // Too Many Requests
            response.setContentType("application/json");
            response.getWriter().write("{\"erro\":\"Muitas requisicoes. Tente novamente em instantes.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    /** Contador de requisicoes de um unico IP dentro da janela atual. */
    private static class Contador {
        private long inicioJanela = System.currentTimeMillis();
        private int quantidade = 0;

        synchronized boolean permitir(int windowSeconds, int maxRequests) {
            long agora = System.currentTimeMillis();
            if (agora - inicioJanela > windowSeconds * 1000L) {
                inicioJanela = agora;
                quantidade = 0;
            }
            quantidade++;
            return quantidade <= maxRequests;
        }
    }
}
