package com.serviceflow.backend.service;

import com.serviceflow.backend.dto.JobRequest;
import com.serviceflow.backend.dto.JobResponse;
import com.serviceflow.backend.dto.TechnicianSuggestionResponse;
import com.serviceflow.backend.entity.Customer;
import com.serviceflow.backend.entity.Job;
import com.serviceflow.backend.entity.Location;
import com.serviceflow.backend.entity.Tenant;
import com.serviceflow.backend.entity.User;
import com.serviceflow.backend.entity.UserSkill;
import com.serviceflow.backend.entity.UserTerritory;
import com.serviceflow.backend.exception.ResourceNotFoundException;
import com.serviceflow.backend.repository.CustomerRepository;
import com.serviceflow.backend.repository.JobRepository;
import com.serviceflow.backend.repository.LocationRepository;
import com.serviceflow.backend.repository.TenantRepository;
import com.serviceflow.backend.repository.UserRepository;
import com.serviceflow.backend.repository.UserSkillRepository;
import com.serviceflow.backend.repository.UserTerritoryRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final CustomerRepository customerRepository;
    private final LocationRepository locationRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final UserTerritoryRepository userTerritoryRepository;

    // The state machine: which statuses can move to which next statuses.
    private static final Map<String, Set<String>> ALLOWED_TRANSITIONS = Map.of(
            "NEW", Set.of("BOOKED", "CANCELLED"),
            "BOOKED", Set.of("DISPATCHED", "CANCELLED"),
            "DISPATCHED", Set.of("IN_PROGRESS", "CANCELLED"),
            "IN_PROGRESS", Set.of("COMPLETED"),
            "COMPLETED", Set.of("PAID"),
            "PAID", Set.of(),
            "CANCELLED", Set.of()
    );

    public JobService(
            JobRepository jobRepository,
            CustomerRepository customerRepository,
            LocationRepository locationRepository,
            TenantRepository tenantRepository,
            UserRepository userRepository,
            UserSkillRepository userSkillRepository,
            UserTerritoryRepository userTerritoryRepository
    ) {
        this.jobRepository = jobRepository;
        this.customerRepository = customerRepository;
        this.locationRepository = locationRepository;
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
        this.userTerritoryRepository = userTerritoryRepository;
    }

    public JobResponse createJob(JobRequest request, Long requestingTenantId, Long requestingUserId) {

        boolean customerBelongsToTenant = customerRepository.existsByIdAndTenantId(
                request.getCustomerId(), requestingTenantId
        );
        if (!customerBelongsToTenant) {
            throw new ResourceNotFoundException("Customer not found");
        }

        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found"));

        if (!location.getTenant().getId().equals(requestingTenantId)
                || !location.getCustomer().getId().equals(request.getCustomerId())) {
            throw new ResourceNotFoundException("Location not found");
        }

        Tenant tenant = tenantRepository.findById(requestingTenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        User createdBy = userRepository.findById(requestingUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Job job = new Job();
        job.setTenant(tenant);
        job.setCustomer(customer);
        job.setLocation(location);
        job.setCategory(request.getCategory().trim());
        job.setDescription(request.getDescription().trim());
        job.setPriority(request.getPriority().trim().toUpperCase());
        job.setSource(request.getSource().trim().toUpperCase());
        job.setStatus("NEW");
        job.setCreatedBy(createdBy);

        Job saved = jobRepository.save(job);

        return mapToResponse(saved);
    }

    public List<JobResponse> getJobsForTenant(Long tenantId) {
        return jobRepository.findByTenantId(tenantId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public JobResponse getJobById(Long id, Long requestingTenantId) {

        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getTenant().getId().equals(requestingTenantId)) {
            throw new ResourceNotFoundException("Job not found");
        }

        return mapToResponse(job);
    }

    public JobResponse updateStatus(Long id, String newStatus, Long requestingTenantId) {

        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getTenant().getId().equals(requestingTenantId)) {
            throw new ResourceNotFoundException("Job not found");
        }

        String normalizedNewStatus = newStatus.trim().toUpperCase();
        String currentStatus = job.getStatus();

        Set<String> allowedNext = ALLOWED_TRANSITIONS.getOrDefault(currentStatus, Set.of());

        if (!allowedNext.contains(normalizedNewStatus)) {
            throw new com.serviceflow.backend.exception.DuplicateResourceException(
                "Cannot move job from " + currentStatus + " to " + normalizedNewStatus
        
            );
        }

        job.setStatus(normalizedNewStatus);
        Job saved = jobRepository.save(job);

        return mapToResponse(saved);
    }

    public List<TechnicianSuggestionResponse> getSuggestedTechnicians(Long jobId, Long requestingTenantId) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getTenant().getId().equals(requestingTenantId)) {
            throw new ResourceNotFoundException("Job not found");
        }

        String category = job.getCategory();
        Long territoryId = (job.getLocation().getTerritory() != null)
                ? job.getLocation().getTerritory().getId()
                : null;

        List<User> technicians = userRepository.findByTenantIdAndRole(requestingTenantId, "TECHNICIAN");

        List<TechnicianSuggestionResponse> suggestions = new ArrayList<>();

        for (User tech : technicians) {

            boolean hasMatchingSkill = userSkillRepository.findByUserId(tech.getId())
                    .stream()
                    .map(UserSkill::getSkill)
                    .anyMatch(skill -> skill.getName().equalsIgnoreCase(category));

            boolean hasMatchingTerritory = territoryId != null &&
                    userTerritoryRepository.findByUserId(tech.getId())
                            .stream()
                            .map(UserTerritory::getTerritory)
                            .anyMatch(territory -> territory.getId().equals(territoryId));

            TechnicianSuggestionResponse suggestion = new TechnicianSuggestionResponse();
            suggestion.setUserId(tech.getId());
            suggestion.setFullName(tech.getFullName());
            suggestion.setEmail(tech.getEmail());
            suggestion.setHasMatchingSkill(hasMatchingSkill);
            suggestion.setHasMatchingTerritory(hasMatchingTerritory);

            suggestions.add(suggestion);
        }

        suggestions.sort((a, b) -> {
            int scoreA = (a.isHasMatchingSkill() ? 2 : 0) + (a.isHasMatchingTerritory() ? 1 : 0);
            int scoreB = (b.isHasMatchingSkill() ? 2 : 0) + (b.isHasMatchingTerritory() ? 1 : 0);
            return scoreB - scoreA;
        });

        return suggestions;
    }

    private JobResponse mapToResponse(Job job) {
        JobResponse response = new JobResponse();
        response.setId(job.getId());
        response.setTenantId(job.getTenant().getId());
        response.setCustomerId(job.getCustomer().getId());
        response.setCustomerName(job.getCustomer().getName());
        response.setLocationId(job.getLocation().getId());
        response.setCategory(job.getCategory());
        response.setDescription(job.getDescription());
        response.setStatus(job.getStatus());
        response.setPriority(job.getPriority());
        response.setSource(job.getSource());
        response.setCreatedById(job.getCreatedBy().getId());
        response.setCreatedByName(job.getCreatedBy().getFullName());
        response.setCreatedAt(job.getCreatedAt());
        response.setUpdatedAt(job.getUpdatedAt());
        return response;
    }
}