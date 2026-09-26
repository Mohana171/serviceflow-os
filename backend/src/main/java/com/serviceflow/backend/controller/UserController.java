package com.serviceflow.backend.controller;

import com.serviceflow.backend.dto.UserRequest;
import com.serviceflow.backend.dto.UserResponse;
import com.serviceflow.backend.dto.UserUpdateRequest;
import com.serviceflow.backend.security.AuthenticatedUser;
import com.serviceflow.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    @PostMapping
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody UserRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser me = (AuthenticatedUser) authentication.getPrincipal();
        UserResponse response = userService.createUserAsStaff(request, me.getTenantId(), me.getRole());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser me = (AuthenticatedUser) authentication.getPrincipal();
        return ResponseEntity.ok(userService.updateUser(id, request, me.getTenantId(), me.getRole()));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<UserResponse> deactivateUser(
            @PathVariable Long id,
            Authentication authentication
    ) {
        AuthenticatedUser me = (AuthenticatedUser) authentication.getPrincipal();
        return ResponseEntity.ok(userService.setUserActive(id, false, me.getTenantId(), me.getRole()));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    @PatchMapping("/{id}/reactivate")
    public ResponseEntity<UserResponse> reactivateUser(
            @PathVariable Long id,
            Authentication authentication
    ) {
        AuthenticatedUser me = (AuthenticatedUser) authentication.getPrincipal();
        return ResponseEntity.ok(userService.setUserActive(id, true, me.getTenantId(), me.getRole()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();

        UserResponse response = userService.getUserById(
                id,
                currentUser.getTenantId(),
                currentUser.getUserId(),
                currentUser.getRole()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getUsersForCurrentTenant(
            Authentication authentication
    ) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();

        List<UserResponse> responses = userService.getUsersVisibleToRequester(
                currentUser.getTenantId(),
                currentUser.getUserId(),
                currentUser.getRole()
        );

        return ResponseEntity.ok(responses);
    }
}