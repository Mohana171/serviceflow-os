package com.serviceflow.backend.dto;

public class TenantRequest {
    private String name;
    private String timezone;
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
}
