package com.serviceflow.backend.controller;

import com.serviceflow.backend.dto.LocationRequest;
import com.serviceflow.backend.dto.LocationResponse;
import com.serviceflow.backend.security.AuthenticatedUser;
import com.serviceflow.backend.service.LocationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    @PostMapping
    public ResponseEntity<LocationResponse> createLocation(
            @Valid @RequestBody LocationRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();

        LocationResponse response = locationService.createLocation(request, currentUser.getTenantId());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<LocationResponse>> getLocationsForCustomer(
            @PathVariable Long customerId,
            Authentication authentication
    ) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();

        List<LocationResponse> responses = locationService.getLocationsForCustomer(customerId, currentUser.getTenantId());

        return ResponseEntity.ok(responses);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    @PutMapping("/{id}")
    public ResponseEntity<LocationResponse> updateLocation(
            @PathVariable Long id,
            @Valid @RequestBody LocationRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();

        LocationResponse response = locationService.updateLocation(id, request, currentUser.getTenantId());

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateLocation(
            @PathVariable Long id,
            Authentication authentication
    ) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();

        locationService.deactivateLocation(id, currentUser.getTenantId());

        return ResponseEntity.noContent().build();
    }
}