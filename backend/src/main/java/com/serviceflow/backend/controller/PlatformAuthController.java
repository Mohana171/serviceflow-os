package com.serviceflow.backend.controller;

import com.serviceflow.backend.security.JwtService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/platform")
public class PlatformAuthController {

    private final JwtService jwtService;
    private final String adminUsername;
    private final String adminPassword;

    public PlatformAuthController(
            JwtService jwtService,
            @Value("${platform.admin.username:}") String adminUsername,
            @Value("${platform.admin.password:}") String adminPassword
    ) {
        this.jwtService = jwtService;
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> body) {
        String username = body.getOrDefault("username", "");
        String password = body.getOrDefault("password", "");

        boolean configured = !adminUsername.isBlank() && !adminPassword.isBlank();
        boolean valid = configured
                && constantTimeEquals(username, adminUsername)
                && constantTimeEquals(password, adminPassword);

        if (!valid) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String token = jwtService.generateToken(0L, null, "PLATFORM_ADMIN");
        return ResponseEntity.ok(Map.of("token", token, "username", adminUsername));
    }

    private boolean constantTimeEquals(String a, String b) {
        return MessageDigest.isEqual(
                a.getBytes(StandardCharsets.UTF_8),
                b.getBytes(StandardCharsets.UTF_8));
    }
}