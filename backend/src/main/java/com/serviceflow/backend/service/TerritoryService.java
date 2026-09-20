package com.serviceflow.backend.service;

import com.serviceflow.backend.dto.TerritoryRequest;
import com.serviceflow.backend.dto.TerritoryResponse;
import com.serviceflow.backend.entity.Territory;
import com.serviceflow.backend.entity.Tenant;
import com.serviceflow.backend.exception.ResourceNotFoundException;
import com.serviceflow.backend.repository.TerritoryRepository;
import com.serviceflow.backend.repository.TenantRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TerritoryService {

    private final TerritoryRepository territoryRepository;
    private final TenantRepository tenantRepository;

    public TerritoryService(TerritoryRepository territoryRepository, TenantRepository tenantRepository) {
        this.territoryRepository = territoryRepository;
        this.tenantRepository = tenantRepository;
    }

    public TerritoryResponse createTerritory(TerritoryRequest request, Long tenantId) {

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        Territory territory = new Territory();
        territory.setTenant(tenant);
        territory.setName(request.getName().trim());
        territory.setActive(true);

        Territory saved = territoryRepository.save(territory);

        return mapToResponse(saved);
    }

    public List<TerritoryResponse> getTerritoriesForTenant(Long tenantId) {
        return territoryRepository.findByTenantIdAndActiveTrue(tenantId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private TerritoryResponse mapToResponse(Territory territory) {
        TerritoryResponse response = new TerritoryResponse();
        response.setId(territory.getId());
        response.setTenantId(territory.getTenant().getId());
        response.setName(territory.getName());
        response.setActive(territory.isActive());
        response.setCreatedAt(territory.getCreatedAt());
        response.setUpdatedAt(territory.getUpdatedAt());
        return response;
    }
}