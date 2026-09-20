package com.serviceflow.backend.entity;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class UserTerritoryId implements Serializable {

    private Long userId;
    private Long territoryId;

    public UserTerritoryId() {}

    public UserTerritoryId(Long userId, Long territoryId) {
        this.userId = userId;
        this.territoryId = territoryId;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getTerritoryId() { return territoryId; }
    public void setTerritoryId(Long territoryId) { this.territoryId = territoryId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserTerritoryId)) return false;
        UserTerritoryId that = (UserTerritoryId) o;
        return Objects.equals(userId, that.userId) && Objects.equals(territoryId, that.territoryId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, territoryId);
    }
}