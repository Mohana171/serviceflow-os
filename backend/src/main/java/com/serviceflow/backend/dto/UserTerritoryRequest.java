package com.serviceflow.backend.dto;

import jakarta.validation.constraints.NotNull;

public class UserTerritoryRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Territory ID is required")
    private Long territoryId;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getTerritoryId() { return territoryId; }
    public void setTerritoryId(Long territoryId) { this.territoryId = territoryId; }
}