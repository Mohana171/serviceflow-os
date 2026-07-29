package com.serviceflow.backend.repository;
import com.serviceflow.backend.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TenantRepository extends JpaRepository<Tenant,Long> {
    List<Tenant> findByActiveTrue();
    boolean existsByNameIgnoreCase(String name);
    Optional<Tenant> findByIdAndActiveTrue(Long id);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
