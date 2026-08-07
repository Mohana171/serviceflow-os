package com.serviceflow.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class CustomerRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String primaryPhone;

    private String email;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPrimaryPhone() { return primaryPhone; }
    public void setPrimaryPhone(String primaryPhone) { this.primaryPhone = primaryPhone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}