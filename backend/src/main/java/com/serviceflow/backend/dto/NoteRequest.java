package com.serviceflow.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class NoteRequest {

    @NotNull(message = "Job ID is required")
    private Long jobId;

    @NotBlank(message = "Body is required")
    private String body;

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
}