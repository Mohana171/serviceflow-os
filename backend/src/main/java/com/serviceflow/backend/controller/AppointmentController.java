package com.serviceflow.backend.controller;

import com.serviceflow.backend.dto.AppointmentRequest;
import com.serviceflow.backend.dto.AppointmentResponse;
import com.serviceflow.backend.security.AuthenticatedUser;
import com.serviceflow.backend.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    @PostMapping
    public ResponseEntity<AppointmentResponse> createAppointment(
            @Valid @RequestBody AppointmentRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();
        AppointmentResponse response = appointmentService.createAppointment(request, currentUser.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<AppointmentResponse>> getForJob(
            @PathVariable Long jobId,
            Authentication authentication
    ) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();
        return ResponseEntity.ok(appointmentService.getAppointmentsForJob(
                jobId, currentUser.getTenantId(), currentUser.getUserId(), currentUser.getRole()));
    }

    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<List<AppointmentResponse>> getForTechnician(
            @PathVariable Long technicianId,
            Authentication authentication
    ) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();
        return ResponseEntity.ok(appointmentService.getAppointmentsForTechnician(
                technicianId, currentUser.getTenantId(), currentUser.getUserId(), currentUser.getRole()));
    }
}