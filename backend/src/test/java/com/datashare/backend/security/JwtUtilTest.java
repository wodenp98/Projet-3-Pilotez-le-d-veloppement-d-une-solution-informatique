package com.datashare.backend.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        String testSecret = "eafc1352bce75e280aa71452de951ae7181fad3a23f9f74e9f92491a88b5eecdcf7f17ac2174c6dfcf08d289a9a57e2f4ebbf9fb8db0d2add785be335fdd1402";
        jwtUtil = new JwtUtil(testSecret, 86400000);
    }

    @Test
    void generateToken_returnsNonNullToken() {
        String token = jwtUtil.generateToken("test@test.com");

        assertThat(token).isNotNull().isNotBlank();
    }

    @Test
    void extractEmail_returnsCorrectEmail() {
        String token = jwtUtil.generateToken("test@test.com");

        String email = jwtUtil.extractEmail(token);

        assertThat(email).isEqualTo("test@test.com");
    }

    @Test
    void isTokenValid_validToken_returnsTrue() {
        String token = jwtUtil.generateToken("test@test.com");

        assertThat(jwtUtil.isTokenValid(token)).isTrue();
    }

    @Test
    void isTokenValid_invalidToken_returnsFalse() {
        assertThat(jwtUtil.isTokenValid("invalid-token")).isFalse();
    }
}
