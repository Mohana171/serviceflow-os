package com.serviceflow.backend.dto;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public class AppointmentRequest {

    @NotNull(message = "Job ID is required")
    private Long jobId;

    @NotNull(message = "Technician ID is required")
    private Long technicianId;

    @NotNull(message = "Scheduled start is required")
    private Instant scheduledStart;

    @NotNull(message = "Scheduled end is required")
    private Instant scheduledEnd;

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public Long getTechnicianId() { return technicianId; }
    public void setTechnicianId(Long technicianId) { this.technicianId = technicianId; }

    public Instant getScheduledStart() { return scheduledStart; }
    public void setScheduledStart(Instant scheduledStart) { this.scheduledStart = scheduledStart; }

    public Instant getScheduledEnd() { return scheduledEnd; }
    public void setScheduledEnd(Instant scheduledEnd) { this.scheduledEnd = scheduledEnd; }
}