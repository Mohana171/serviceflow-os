package com.serviceflow.backend.controller;

import com.serviceflow.backend.dto.TenantRequest;
import com.serviceflow.backend.dto.TenantResponse;
import com.serviceflow.backend.dto.UserRequest;
import com.serviceflow.backend.dto.UserResponse;
import com.serviceflow.backend.service.TenantService;
import com.serviceflow.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/tenants")
@PreAuthorize("hasRole('PLATFORM_ADMIN')")
public class TenantController {

    private final TenantService tenantService;
    private final UserService userService;

    public TenantController(TenantService tenantService, UserService userService) {
        this.tenantService = tenantService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<TenantResponse> createTenant(@RequestBody TenantRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tenantService.createTenant(request));
    }

    @GetMapping
    public ResponseEntity<List<TenantResponse>> getAllTenants() {
        return ResponseEntity.ok(tenantService.getAllTenants());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TenantResponse> getTenantById(@PathVariable Long id) {
        return ResponseEntity.ok(tenantService.getTenantById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TenantResponse> updateTenant(
            @PathVariable Long id, @RequestBody TenantRequest request) {
        return ResponseEntity.ok(tenantService.updateTenant(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTenant(@PathVariable Long id) {
        tenantService.deleteTenant(id);
        return ResponseEntity.noContent().build();
    }

    // Creates the first (or any additional) ADMIN for a tenant.
    @PostMapping("/{id}/admin")
    public ResponseEntity<UserResponse> createTenantAdmin(
            @PathVariable Long id, @Valid @RequestBody UserRequest request) {
        request.setRole("ADMIN");
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(request, id));
    }
}