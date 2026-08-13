package com.serviceflow.backend.service;

import com.serviceflow.backend.dto.SkillRequest;
import com.serviceflow.backend.dto.SkillResponse;
import com.serviceflow.backend.entity.Skill;
import com.serviceflow.backend.entity.Tenant;
import com.serviceflow.backend.exception.ResourceNotFoundException;
import com.serviceflow.backend.repository.SkillRepository;
import com.serviceflow.backend.repository.TenantRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SkillService {

    private final SkillRepository skillRepository;
    private final TenantRepository tenantRepository;

    public SkillService(SkillRepository skillRepository, TenantRepository tenantRepository) {
        this.skillRepository = skillRepository;
        this.tenantRepository = tenantRepository;
    }

    public SkillResponse createSkill(SkillRequest request, Long tenantId) {

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        Skill skill = new Skill();
        skill.setTenant(tenant);
        skill.setName(request.getName().trim());
        skill.setActive(true);

        Skill saved = skillRepository.save(skill);

        return mapToResponse(saved);
    }

    public List<SkillResponse> getSkillsForTenant(Long tenantId) {
        return skillRepository.findByTenantIdAndActiveTrue(tenantId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private SkillResponse mapToResponse(Skill skill) {
        SkillResponse response = new SkillResponse();
        response.setId(skill.getId());
        response.setTenantId(skill.getTenant().getId());
        response.setName(skill.getName());
        response.setActive(skill.isActive());
        response.setCreatedAt(skill.getCreatedAt());
        response.setUpdatedAt(skill.getUpdatedAt());
        return response;
    }
}