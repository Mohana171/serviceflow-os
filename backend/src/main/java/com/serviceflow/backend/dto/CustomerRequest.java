package com.serviceflow.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class CustomerRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @Pattern(regexp = "^[\\d\\s()+.-]{7,20}$", message = "Phone number format is invalid")
    private String primaryPhone;


    private String email;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPrimaryPhone() { return primaryPhone; }
    public void setPrimaryPhone(String primaryPhone) { this.primaryPhone = primaryPhone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}