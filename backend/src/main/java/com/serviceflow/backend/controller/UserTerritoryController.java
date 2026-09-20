package com.serviceflow.backend.controller;

import com.serviceflow.backend.dto.UserTerritoryRequest;
import com.serviceflow.backend.dto.UserTerritoryResponse;
import com.serviceflow.backend.security.AuthenticatedUser;
import com.serviceflow.backend.service.UserTerritoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-territories")
public class UserTerritoryController {

    private final UserTerritoryService userTerritoryService;

    public UserTerritoryController(UserTerritoryService userTerritoryService) {
        this.userTerritoryService = userTerritoryService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<UserTerritoryResponse> assignTerritory(
            @Valid @RequestBody UserTerritoryRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();

        UserTerritoryResponse response = userTerritoryService.assignTerritoryToUser(
                request.getUserId(), request.getTerritoryId(), currentUser.getTenantId()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserTerritoryResponse>> getTerritoriesForUser(
            @PathVariable Long userId,
            Authentication authentication
    ) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();

        List<UserTerritoryResponse> responses = userTerritoryService.getTerritoriesForUser(userId, currentUser.getTenantId());

        return ResponseEntity.ok(responses);
    }
}