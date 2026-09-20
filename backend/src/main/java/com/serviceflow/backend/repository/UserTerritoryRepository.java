package com.serviceflow.backend.repository;

import com.serviceflow.backend.entity.UserTerritory;
import com.serviceflow.backend.entity.UserTerritoryId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserTerritoryRepository extends JpaRepository<UserTerritory, UserTerritoryId> {

    List<UserTerritory> findByUserId(Long userId);

    boolean existsByUserIdAndTerritoryId(Long userId, Long territoryId);
}