package com.serviceflow.backend.dto;

import java.time.Instant;
public class TenantResponse {

    private Long id;
    private String name;
    private String timezone;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;

    public Long getId() { 
        return id; 
    }
    public void setId(Long id) { 
        this.id = id; 
    }

    public String getName() { 
        return name; 
    }
    public void setName(String name) { 
        this.name = name; 
    }

    public String getTimezone() { 
        return timezone; 
    }
    public void setTimezone(String timezone) { 
        this.timezone = timezone; 
    }

    public boolean isActive() { 
        return active; 
    }
    public void setActive(boolean active) { 
        this.active = active;
    }

    public Instant getCreatedAt() { 
        return createdAt; 
    }
    public void setCreatedAt(Instant createdAt) { 
        this.createdAt = createdAt; 
    }

    public Instant getUpdatedAt() { 
        return updatedAt; 
    }
    public void setUpdatedAt(Instant updatedAt) { 
        this.updatedAt = updatedAt; 
    }
}