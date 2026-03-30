package com.openclassrooms.etudiant.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for JwtService.
 * Focuses on token generation, extraction, and validation.
 */
public class JwtServiceTest {

    private JwtService jwtService;
    private final String SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private final long EXPIRATION = 3600000;

    @BeforeEach
    public void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", SECRET);
        ReflectionTestUtils.setField(jwtService, "expiration", EXPIRATION);
    }

    /**
     * Test token generation and username extraction.
     */
    @Test
    public void generateTokenAndExtractUsername() {
        // GIVEN
        UserDetails userDetails = new User("testuser", "password", Collections.emptyList());

        // WHEN
        String token = jwtService.generateToken(userDetails);
        String extractedUsername = jwtService.extractUsername(token);

        // THEN
        assertThat(token).isNotNull();
        assertThat(extractedUsername).isEqualTo("testuser");
    }

    /**
     * Test token validation with correct user.
     */
    @Test
    public void isTokenValidSuccess() {
        // GIVEN
        UserDetails userDetails = new User("testuser", "password", Collections.emptyList());
        String token = jwtService.generateToken(userDetails);

        // WHEN
        boolean isValid = jwtService.isTokenValid(token, userDetails);

        // THEN
        assertThat(isValid).isTrue();
    }
}
