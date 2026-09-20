package com.serviceflow.backend.dto;

import java.time.Instant;

public class AppointmentResponse {

    private Long id;
    private Long tenantId;
    private Long jobId;
    private Long technicianId;
    private String technicianName;
    private Instant scheduledStart;
    private Instant scheduledEnd;
    private Instant actualStart;
    private Instant actualEnd;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public Long getTechnicianId() { return technicianId; }
    public void setTechnicianId(Long technicianId) { this.technicianId = technicianId; }

    public String getTechnicianName() { return technicianName; }
    public void setTechnicianName(String technicianName) { this.technicianName = technicianName; }

    public Instant getScheduledStart() { return scheduledStart; }
    public void setScheduledStart(Instant scheduledStart) { this.scheduledStart = scheduledStart; }

    public Instant getScheduledEnd() { return scheduledEnd; }
    public void setScheduledEnd(Instant scheduledEnd) { this.scheduledEnd = scheduledEnd; }

    public Instant getActualStart() { return actualStart; }
    public void setActualStart(Instant actualStart) { this.actualStart = actualStart; }

    public Instant getActualEnd() { return actualEnd; }
    public void setActualEnd(Instant actualEnd) { this.actualEnd = actualEnd; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}