package com.serviceflow.backend.repository;

import com.serviceflow.backend.entity.Territory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TerritoryRepository extends JpaRepository<Territory, Long> {

    List<Territory> findByTenantIdAndActiveTrue(Long tenantId);

    boolean existsByIdAndTenantId(Long id, Long tenantId);
}