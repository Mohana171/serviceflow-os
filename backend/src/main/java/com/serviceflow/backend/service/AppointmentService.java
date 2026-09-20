package com.serviceflow.backend.service;

import com.serviceflow.backend.dto.AppointmentRequest;
import com.serviceflow.backend.dto.AppointmentResponse;
import com.serviceflow.backend.entity.Appointment;
import com.serviceflow.backend.entity.Job;
import com.serviceflow.backend.entity.Tenant;
import com.serviceflow.backend.entity.User;
import com.serviceflow.backend.exception.ResourceNotFoundException;
import com.serviceflow.backend.repository.AppointmentRepository;
import com.serviceflow.backend.repository.JobRepository;
import com.serviceflow.backend.repository.TenantRepository;
import com.serviceflow.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            JobRepository jobRepository,
            UserRepository userRepository,
            TenantRepository tenantRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
    }

    public AppointmentResponse createAppointment(AppointmentRequest request, Long requestingTenantId) {

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getTenant().getId().equals(requestingTenantId)) {
            throw new ResourceNotFoundException("Job not found");
        }

        User technician = userRepository.findById(request.getTechnicianId())
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found"));

        if (!technician.getTenant().getId().equals(requestingTenantId)) {
            throw new ResourceNotFoundException("Technician not found");
        }

        if (!"TECHNICIAN".equals(technician.getRole())) {
            throw new IllegalStateException("Assigned user must have the TECHNICIAN role");
        }

        Tenant tenant = tenantRepository.findById(requestingTenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        Appointment appointment = new Appointment();
        appointment.setTenant(tenant);
        appointment.setJob(job);
        appointment.setTechnician(technician);
        appointment.setScheduledStart(request.getScheduledStart());
        appointment.setScheduledEnd(request.getScheduledEnd());
        appointment.setStatus("SCHEDULED");

        Appointment saved = appointmentRepository.save(appointment);

        return mapToResponse(saved);
    }

    public List<AppointmentResponse> getAppointmentsForJob(Long jobId, Long requestingTenantId) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getTenant().getId().equals(requestingTenantId)) {
            throw new ResourceNotFoundException("Job not found");
        }

        return appointmentRepository.findByJobId(jobId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponse> getAppointmentsForTechnician(Long technicianId, Long requestingTenantId) {

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found"));

        if (!technician.getTenant().getId().equals(requestingTenantId)) {
            throw new ResourceNotFoundException("Technician not found");
        }

        return appointmentRepository.findByTechnicianId(technicianId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        AppointmentResponse response = new AppointmentResponse();
        response.setId(appointment.getId());
        response.setTenantId(appointment.getTenant().getId());
        response.setJobId(appointment.getJob().getId());
        response.setTechnicianId(appointment.getTechnician().getId());
        response.setTechnicianName(appointment.getTechnician().getFullName());
        response.setScheduledStart(appointment.getScheduledStart());
        response.setScheduledEnd(appointment.getScheduledEnd());
        response.setActualStart(appointment.getActualStart());
        response.setActualEnd(appointment.getActualEnd());
        response.setStatus(appointment.getStatus());
        response.setCreatedAt(appointment.getCreatedAt());
        response.setUpdatedAt(appointment.getUpdatedAt());
        return response;
    }
}