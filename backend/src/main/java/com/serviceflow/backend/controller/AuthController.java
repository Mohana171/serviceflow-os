package com.serviceflow.backend.controller;

import com.serviceflow.backend.dto.LoginRequest;
import com.serviceflow.backend.dto.LoginResponse;
import com.serviceflow.backend.entity.User;
import com.serviceflow.backend.repository.UserRepository;
import com.serviceflow.backend.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {

        User user = userRepository
                .findByTenantIdAndEmail(request.getTenantId(), request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        if (!user.isActive() || !user.getTenant().getActive()) {
            throw new BadCredentialsException(
                    "This account has been deactivated. Contact your administrator.");
        }

        String token = jwtService.generateToken(user.getId(), user.getTenant().getId(), user.getRole());

        LoginResponse response = new LoginResponse(
                token, user.getId(), user.getTenant().getId(), user.getRole(), user.getFullName()
        );

        return ResponseEntity.ok(response);
    }
}