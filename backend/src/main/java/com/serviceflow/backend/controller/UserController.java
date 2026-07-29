package com.serviceflow.backend.controller;

import com.serviceflow.backend.dto.UserRequest;
import com.serviceflow.backend.dto.UserResponse;
import com.serviceflow.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody UserRequest request
    ) {
        UserResponse response = userService.createUser(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable Long id
    ) {
        UserResponse response = userService.getUserById(id);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<List<UserResponse>> getUsersByTenant(
            @PathVariable Long tenantId
    ) {
        List<UserResponse> responses =
                userService.getUsersByTenant(tenantId);

        return ResponseEntity.ok(responses);
    }
}