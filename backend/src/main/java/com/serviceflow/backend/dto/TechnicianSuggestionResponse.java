package com.serviceflow.backend.dto;

public class TechnicianSuggestionResponse {

    private Long userId;
    private String fullName;
    private String email;
    private boolean hasMatchingSkill;
    private boolean hasMatchingTerritory;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public boolean isHasMatchingSkill() { return hasMatchingSkill; }
    public void setHasMatchingSkill(boolean hasMatchingSkill) { this.hasMatchingSkill = hasMatchingSkill; }

    public boolean isHasMatchingTerritory() { return hasMatchingTerritory; }
    public void setHasMatchingTerritory(boolean hasMatchingTerritory) { this.hasMatchingTerritory = hasMatchingTerritory; }
}