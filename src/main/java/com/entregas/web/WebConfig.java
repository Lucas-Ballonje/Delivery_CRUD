package com.entregas.web;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

/**
 * Libera o front-end (Vite, rodando em localhost:5173) para chamar a API em
 * localhost:8080, que fica em outra origem do ponto de vista do navegador.
 *
 * Registrado como Filter (nao apenas como CORS do Spring MVC) e com a maior
 * prioridade possivel, para rodar ANTES do RateLimitFilter e do AuthFilter.
 * Isso garante que os headers de CORS vao em toda resposta, inclusive nos
 * 401/429 que esses filtros escrevem direto no response - sem isso, o
 * navegador bloqueia essas respostas de erro por falta de CORS e o front
 * enxerga como "nao foi possivel conectar", mesmo com a API rodando.
 */
@Configuration
public class WebConfig {

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://127.0.0.1:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        FilterRegistrationBean<CorsFilter> registration = new FilterRegistrationBean<>(new CorsFilter(source));
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registration;
    }
}
