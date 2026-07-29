package com.serviceflow.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.Instant;

@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_user_tenant_email",
                        columnNames = {"tenant_id", "email"}
                )
        }
    )
    public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="tenant_id",nullable = false)
    private Tenant tenant;
    @Column(name="full_name",nullable=false)
    private String fullName;
    @Column(nullable=false)
    private String email;
    @Column(name="password_hash",nullable=false)
    private String passwordHash;
    @Column(nullable=false)
    private String role;
    @Column(nullable =false)
    private boolean active=true;
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Long getId() {return id;}
    public Tenant getTenant() {return tenant;}
    public void setTenant(Tenant tenant) {this.tenant=tenant;}
    public String getFullName() {return fullName;}
    public void setFullName(String fullName) {this.fullName=fullName;}
    public String getEmail() {return email;}
    public void setEmail(String email) {this.email=email;}
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
