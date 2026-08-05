package com.serviceflow.backend.security;

public class AuthenticatedUser {

    private final Long userId;
    private final Long tenantId;
    private final String role;

    public AuthenticatedUser(Long userId, Long tenantId, String role) {
        this.userId = userId;
        this.tenantId = tenantId;
        this.role = role;
    }

    public Long getUserId() { return userId; }
    public Long getTenantId() { return tenantId; }
    public String getRole() { return role; }
}