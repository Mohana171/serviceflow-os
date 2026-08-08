package com.serviceflow.backend.repository;

import com.serviceflow.backend.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LocationRepository extends JpaRepository<Location, Long> {

    List<Location> findByCustomerIdAndActiveTrue(Long customerId);

    List<Location> findByTenantIdAndActiveTrue(Long tenantId);
}