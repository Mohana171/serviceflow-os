package com.serviceflow.backend.controller;

import com.serviceflow.backend.dto.ScheduleRequest;
import com.serviceflow.backend.dto.ScheduleResponse;
import com.serviceflow.backend.security.AuthenticatedUser;
import com.serviceflow.backend.service.ScheduleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    @PostMapping
    public ResponseEntity<ScheduleResponse> createSchedule(
            @Valid @RequestBody ScheduleRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();

         ScheduleResponse response = scheduleService.createSchedule(
            request, currentUser.getTenantId(), currentUser.getRole());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ScheduleResponse>> getScheduleForUser(
            @PathVariable Long userId,
            Authentication authentication
    ) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();

        List<ScheduleResponse> responses = scheduleService.getScheduleForUser(
                userId, currentUser.getTenantId(), currentUser.getUserId(), currentUser.getRole());
        return ResponseEntity.ok(responses);
    }
}