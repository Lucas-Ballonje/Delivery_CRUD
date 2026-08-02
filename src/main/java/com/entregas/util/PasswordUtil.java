package com.entregas.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Hash simples de senha (SHA-256 + salt aleatorio por usuario).
 * Formato salvo: "salt:hash", ambos em Base64.
 */
public final class PasswordUtil {

    private PasswordUtil() {
    }

    public static String hash(String senhaPura) {
        byte[] salt = new byte[16];
        new SecureRandom().nextBytes(salt);
        byte[] hash = digest(senhaPura, salt);
        return Base64.getEncoder().encodeToString(salt) + ":" + Base64.getEncoder().encodeToString(hash);
    }

    public static boolean matches(String senhaPura, String senhaHashArmazenada) {
        String[] partes = senhaHashArmazenada.split(":");
        if (partes.length != 2) {
            return false;
        }
        byte[] salt = Base64.getDecoder().decode(partes[0]);
        byte[] hashEsperado = Base64.getDecoder().decode(partes[1]);
        byte[] hashCalculado = digest(senhaPura, salt);
        return MessageDigest.isEqual(hashEsperado, hashCalculado);
    }

    private static byte[] digest(String senha, byte[] salt) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(salt);
            return md.digest(senha.getBytes());
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
