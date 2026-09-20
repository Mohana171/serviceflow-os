package com.serviceflow.backend.controller;

import com.serviceflow.backend.dto.TerritoryRequest;
import com.serviceflow.backend.dto.TerritoryResponse;
import com.serviceflow.backend.security.AuthenticatedUser;
import com.serviceflow.backend.service.TerritoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/territories")
public class TerritoryController {

    private final TerritoryService territoryService;

    public TerritoryController(TerritoryService territoryService) {
        this.territoryService = territoryService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<TerritoryResponse> createTerritory(
            @Valid @RequestBody TerritoryRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();

        TerritoryResponse response = territoryService.createTerritory(request, currentUser.getTenantId());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<TerritoryResponse>> getTerritories(Authentication authentication) {

        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();

        List<TerritoryResponse> responses = territoryService.getTerritoriesForTenant(currentUser.getTenantId());

        return ResponseEntity.ok(responses);
    }
}