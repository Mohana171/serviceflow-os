package com.serviceflow.backend.controller;

import com.serviceflow.backend.dto.SkillRequest;
import com.serviceflow.backend.dto.SkillResponse;
import com.serviceflow.backend.security.AuthenticatedUser;
import com.serviceflow.backend.service.SkillService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<SkillResponse> createSkill(
            @Valid @RequestBody SkillRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();

        SkillResponse response = skillService.createSkill(request, currentUser.getTenantId());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<SkillResponse>> getSkills(Authentication authentication) {

        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();

        List<SkillResponse> responses = skillService.getSkillsForTenant(currentUser.getTenantId());

        return ResponseEntity.ok(responses);
    }
}