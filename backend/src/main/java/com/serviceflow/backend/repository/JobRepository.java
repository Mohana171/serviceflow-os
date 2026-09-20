package com.serviceflow.backend.repository;

import com.serviceflow.backend.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByTenantId(Long tenantId);

    boolean existsByIdAndTenantId(Long id, Long tenantId);
}