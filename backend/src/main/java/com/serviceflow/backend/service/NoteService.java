package com.serviceflow.backend.service;

import com.serviceflow.backend.dto.NoteRequest;
import com.serviceflow.backend.dto.NoteResponse;
import com.serviceflow.backend.entity.Job;
import com.serviceflow.backend.entity.Note;
import com.serviceflow.backend.entity.Tenant;
import com.serviceflow.backend.entity.User;
import com.serviceflow.backend.exception.ResourceNotFoundException;
import com.serviceflow.backend.repository.AppointmentRepository;
import com.serviceflow.backend.repository.JobRepository;
import com.serviceflow.backend.repository.NoteRepository;
import com.serviceflow.backend.repository.TenantRepository;
import com.serviceflow.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final AppointmentRepository appointmentRepository;

    public NoteService(
            NoteRepository noteRepository,
            JobRepository jobRepository,
            UserRepository userRepository,
            TenantRepository tenantRepository,
            AppointmentRepository appointmentRepository
    ) {
        this.noteRepository = noteRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.appointmentRepository = appointmentRepository;
    }

    // Loads the job, checking the tenant, and (for technicians) that they are assigned to it
    private Job loadJobForRequester(Long jobId, Long requestingTenantId,
                                    Long requestingUserId, String requestingRole) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getTenant().getId().equals(requestingTenantId)) {
            throw new ResourceNotFoundException("Job not found");
        }

        if ("TECHNICIAN".equals(requestingRole)
                && !appointmentRepository.existsByJobIdAndTechnicianId(jobId, requestingUserId)) {
            throw new ResourceNotFoundException("Job not found");
        }

        return job;
    }

    public NoteResponse createNote(NoteRequest request, Long requestingTenantId,
                                   Long requestingUserId, String requestingRole) {

        Job job = loadJobForRequester(request.getJobId(), requestingTenantId,
                requestingUserId, requestingRole);

        Tenant tenant = tenantRepository.findById(requestingTenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        User author = userRepository.findById(requestingUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Note note = new Note();
        note.setTenant(tenant);
        note.setJob(job);
        note.setAuthor(author);
        note.setBody(request.getBody().trim());

        Note saved = noteRepository.save(note);

        return mapToResponse(saved);
    }

    public List<NoteResponse> getNotesForJob(Long jobId, Long requestingTenantId,
                                             Long requestingUserId, String requestingRole) {

        loadJobForRequester(jobId, requestingTenantId, requestingUserId, requestingRole);

        return noteRepository.findByJobIdOrderByCreatedAtAsc(jobId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private NoteResponse mapToResponse(Note note) {
        NoteResponse response = new NoteResponse();
        response.setId(note.getId());
        response.setJobId(note.getJob().getId());
        response.setAuthorId(note.getAuthor().getId());
        response.setAuthorName(note.getAuthor().getFullName());
        response.setBody(note.getBody());
        response.setCreatedAt(note.getCreatedAt());
        return response;
    }
}