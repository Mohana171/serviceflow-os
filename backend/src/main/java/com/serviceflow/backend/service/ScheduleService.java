package com.serviceflow.backend.service;

import com.serviceflow.backend.dto.ScheduleRequest;
import com.serviceflow.backend.dto.ScheduleResponse;
import com.serviceflow.backend.entity.Schedule;
import com.serviceflow.backend.entity.Tenant;
import com.serviceflow.backend.entity.User;
import com.serviceflow.backend.exception.ResourceNotFoundException;
import com.serviceflow.backend.repository.ScheduleRepository;
import com.serviceflow.backend.repository.TenantRepository;
import com.serviceflow.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;

    public ScheduleService(
            ScheduleRepository scheduleRepository,
            UserRepository userRepository,
            TenantRepository tenantRepository
    ) {
        this.scheduleRepository = scheduleRepository;
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
    }

    public ScheduleResponse createSchedule(ScheduleRequest request, Long requestingTenantId) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getTenant().getId().equals(requestingTenantId)) {
            throw new ResourceNotFoundException("User not found");
        }

        Tenant tenant = tenantRepository.findById(requestingTenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        Schedule schedule = new Schedule();
        schedule.setTenant(tenant);
        schedule.setUser(user);
        schedule.setDay(request.getDay());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setType(request.getType().trim().toUpperCase());

        Schedule saved = scheduleRepository.save(schedule);

        return mapToResponse(saved);
    }

    public List<ScheduleResponse> getScheduleForUser(Long userId, Long requestingTenantId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getTenant().getId().equals(requestingTenantId)) {
            throw new ResourceNotFoundException("User not found");
        }

        return scheduleRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ScheduleResponse mapToResponse(Schedule schedule) {
        ScheduleResponse response = new ScheduleResponse();
        response.setId(schedule.getId());
        response.setTenantId(schedule.getTenant().getId());
        response.setUserId(schedule.getUser().getId());
        response.setUserFullName(schedule.getUser().getFullName());
        response.setDay(schedule.getDay());
        response.setStartTime(schedule.getStartTime());
        response.setEndTime(schedule.getEndTime());
        response.setType(schedule.getType());
        response.setCreatedAt(schedule.getCreatedAt());
        response.setUpdatedAt(schedule.getUpdatedAt());
        return response;
    }
}