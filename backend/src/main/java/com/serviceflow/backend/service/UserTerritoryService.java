package com.serviceflow.backend.service;

import com.serviceflow.backend.dto.UserTerritoryResponse;
import com.serviceflow.backend.entity.Territory;
import com.serviceflow.backend.entity.User;
import com.serviceflow.backend.entity.UserTerritory;
import com.serviceflow.backend.exception.DuplicateResourceException;
import com.serviceflow.backend.exception.ForbiddenActionException;
import com.serviceflow.backend.exception.ResourceNotFoundException;
import com.serviceflow.backend.repository.TerritoryRepository;
import com.serviceflow.backend.repository.UserRepository;
import com.serviceflow.backend.repository.UserTerritoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserTerritoryService {

    private static final String ROLE_DISPATCHER = "DISPATCHER";
    private static final String ROLE_TECHNICIAN = "TECHNICIAN";

    private final UserTerritoryRepository userTerritoryRepository;
    private final UserRepository userRepository;
    private final TerritoryRepository territoryRepository;

    public UserTerritoryService(
            UserTerritoryRepository userTerritoryRepository,
            UserRepository userRepository,
            TerritoryRepository territoryRepository
    ) {
        this.userTerritoryRepository = userTerritoryRepository;
        this.userRepository = userRepository;
        this.territoryRepository = territoryRepository;
    }

    public UserTerritoryResponse assignTerritoryToUser(Long userId, Long territoryId, Long requestingTenantId, String requestingRole) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getTenant().getId().equals(requestingTenantId)) {
            throw new ResourceNotFoundException("User not found");
        }

        requireCanManageTerritoriesFor(user, requestingRole);

        boolean territoryBelongsToTenant = territoryRepository.existsByIdAndTenantId(territoryId, requestingTenantId);
        if (!territoryBelongsToTenant) {
            throw new ResourceNotFoundException("Territory not found");
        }

        if (userTerritoryRepository.existsByUserIdAndTerritoryId(userId, territoryId)) {
            throw new DuplicateResourceException("User already has this territory");
        }

        Territory territory = territoryRepository.findById(territoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Territory not found"));

        UserTerritory userTerritory = new UserTerritory(user, territory);
        UserTerritory saved = userTerritoryRepository.save(userTerritory);

        return mapToResponse(saved);
    }

    public List<UserTerritoryResponse> getTerritoriesForUser(Long userId, Long requestingTenantId, String requestingRole) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getTenant().getId().equals(requestingTenantId)) {
            throw new ResourceNotFoundException("User not found");
        }

        requireCanManageTerritoriesFor(user, requestingRole);

        return userTerritoryRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void requireCanManageTerritoriesFor(User targetUser, String requestingRole) {
        if (ROLE_DISPATCHER.equalsIgnoreCase(requestingRole)
                && !ROLE_TECHNICIAN.equalsIgnoreCase(targetUser.getRole())) {
            throw new ForbiddenActionException("Dispatchers can only manage territories for technicians");
        }
    }

    private UserTerritoryResponse mapToResponse(UserTerritory userTerritory) {
        UserTerritoryResponse response = new UserTerritoryResponse();
        response.setUserId(userTerritory.getUser().getId());
        response.setUserFullName(userTerritory.getUser().getFullName());
        response.setTerritoryId(userTerritory.getTerritory().getId());
        response.setTerritoryName(userTerritory.getTerritory().getName());
        response.setCreatedAt(userTerritory.getCreatedAt());
        return response;
    }
}