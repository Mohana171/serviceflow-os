package com.serviceflow.backend.controller;

import com.serviceflow.backend.dto.UserSkillRequest;
import com.serviceflow.backend.dto.UserSkillResponse;
import com.serviceflow.backend.security.AuthenticatedUser;
import com.serviceflow.backend.service.UserSkillService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-skills")
public class UserSkillController {

    private final UserSkillService userSkillService;

    public UserSkillController(UserSkillService userSkillService) {
        this.userSkillService = userSkillService;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    @PostMapping
    public ResponseEntity<UserSkillResponse> assignSkill(
            @Valid @RequestBody UserSkillRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();

        UserSkillResponse response = userSkillService.assignSkillToUser(
                request.getUserId(), request.getSkillId(),
                currentUser.getTenantId(), currentUser.getRole()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserSkillResponse>> getSkillsForUser(
            @PathVariable Long userId,
            Authentication authentication
    ) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();

        List<UserSkillResponse> responses = userSkillService.getSkillsForUser(
                userId, currentUser.getTenantId(), currentUser.getRole()
        );

        return ResponseEntity.ok(responses);
    }
}