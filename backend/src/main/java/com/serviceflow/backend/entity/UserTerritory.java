package com.serviceflow.backend.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;

@Entity
@Table(name = "user_territories")
public class UserTerritory {

    @EmbeddedId
    private UserTerritoryId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("territoryId")
    @JoinColumn(name = "territory_id")
    private Territory territory;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    public UserTerritory() {}

    public UserTerritory(User user, Territory territory) {
        this.user = user;
        this.territory = territory;
        this.id = new UserTerritoryId(user.getId(), territory.getId());
    }

    public UserTerritoryId getId() { return id; }
    public User getUser() { return user; }
    public Territory getTerritory() { return territory; }
    public Instant getCreatedAt() { return createdAt; }
}