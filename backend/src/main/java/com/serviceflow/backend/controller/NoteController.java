package com.serviceflow.backend.controller;

import com.serviceflow.backend.dto.NoteRequest;
import com.serviceflow.backend.dto.NoteResponse;
import com.serviceflow.backend.security.AuthenticatedUser;
import com.serviceflow.backend.service.NoteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @PostMapping
    public ResponseEntity<NoteResponse> createNote(
            @Valid @RequestBody NoteRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();
        NoteResponse response = noteService.createNote(
                request, currentUser.getTenantId(), currentUser.getUserId(), currentUser.getRole()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<NoteResponse>> getForJob(
            @PathVariable Long jobId,
            Authentication authentication
    ) {
        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();
        return ResponseEntity.ok(noteService.getNotesForJob(
                jobId, currentUser.getTenantId(), currentUser.getUserId(), currentUser.getRole()));
    }
}