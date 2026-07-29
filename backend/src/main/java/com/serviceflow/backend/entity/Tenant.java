package com.serviceflow.backend.entity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.Instant;

@Entity
@Table(name="tenants")
public class Tenant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true,nullable = false)
    private String name;

    @Column(nullable=false)
    private String timezone;

    @Column (nullable=false)
    private boolean active=true;

    @CreationTimestamp
    @Column(name="created_at",nullable=false,updatable = false)
    private Instant CreatedAt;

    @UpdateTimestamp
    @Column(name="updated_at",nullable=false)
    private Instant UpdatedAt;

    public Long getId() {
        return id;
    }
    public String getName(){
        return name;
    }
    public void setName(String name){
        this.name=name;
    }
    public String getTimezone(){
        return timezone;
    }
    public void setTimezone(String timezone){
        this.timezone=timezone;
    }    
    public boolean getActive(){
        return active;
    }
    public void setActive(boolean active){
        this.active=active;
    }
    public Instant getCreatedAt(){
        return CreatedAt;
    }
    public Instant getUpdatedAt(){
        return UpdatedAt;
    }


}

