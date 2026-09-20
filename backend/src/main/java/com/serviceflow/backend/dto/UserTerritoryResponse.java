package com.serviceflow.backend.dto;

import java.time.Instant;

public class UserTerritoryResponse {

    private Long userId;
    private String userFullName;
    private Long territoryId;
    private String territoryName;
    private Instant createdAt;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserFullName() { return userFullName; }
    public void setUserFullName(String userFullName) { this.userFullName = userFullName; }

    public Long getTerritoryId() { return territoryId; }
    public void setTerritoryId(Long territoryId) { this.territoryId = territoryId; }

    public String getTerritoryName() { return territoryName; }
    public void setTerritoryName(String territoryName) { this.territoryName = territoryName; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}