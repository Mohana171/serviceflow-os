package com.serviceflow.backend.dto;

public class LoginResponse {

    private String token;
    private Long userId;
    private Long tenantId;
    private String role;
    private String fullName;

    public LoginResponse(String token, Long userId, Long tenantId, String role, String fullName) {
        this.token = token;
        this.userId = userId;
        this.tenantId = tenantId;
        this.role = role;
        this.fullName = fullName;
    }

    public String getToken() { return token; }
    public Long getUserId() { return userId; }
    public Long getTenantId() { return tenantId; }
    public String getRole() { return role; }
    public String getFullName() { return fullName; }
}