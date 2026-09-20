package com.serviceflow.backend.controller;

import com.serviceflow.backend.dto.JobRequest;
import com.serviceflow.backend.dto.JobResponse;
import com.serviceflow.backend.dto.JobStatusUpdateRequest;
import com.serviceflow.backend.dto.TechnicianSuggestionResponse;
import com.serviceflow.backend.security.AuthenticatedUser;
import com.serviceflow.backend.service.JobService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    @PostMapping
    public ResponseEntity<JobResponse> createJob(
            @Valid @RequestBody JobRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();

        JobResponse response = jobService.createJob(
                request, currentUser.getTenantId(), currentUser.getUserId()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<JobResponse>> getJobs(Authentication authentication) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();
        return ResponseEntity.ok(jobService.getJobsForTenant(currentUser.getTenantId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJobById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();
        return ResponseEntity.ok(jobService.getJobById(id, currentUser.getTenantId()));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<JobResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody JobStatusUpdateRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();
        return ResponseEntity.ok(jobService.updateStatus(id, request.getStatus(), currentUser.getTenantId()));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    @GetMapping("/{id}/suggested-technicians")
    public ResponseEntity<List<TechnicianSuggestionResponse>> getSuggestedTechnicians(
            @PathVariable Long id,
            Authentication authentication
    ) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();
        return ResponseEntity.ok(jobService.getSuggestedTechnicians(id, currentUser.getTenantId()));
    }
}