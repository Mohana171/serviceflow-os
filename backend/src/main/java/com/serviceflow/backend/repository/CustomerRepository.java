package com.serviceflow.backend.repository;

import com.serviceflow.backend.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    List<Customer> findByTenantIdAndActiveTrue(Long tenantId);

    boolean existsByIdAndTenantId(Long id, Long tenantId);
}