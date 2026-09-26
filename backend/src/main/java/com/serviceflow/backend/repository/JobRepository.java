package com.serviceflow.backend.repository;

import com.serviceflow.backend.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByTenantId(Long tenantId);
    boolean existsByIdAndTenantId(Long id, Long tenantId);

    // Jobs a technician has an appointment on
    @Query("select distinct a.job from Appointment a "
         + "where a.technician.id = :technicianId and a.tenant.id = :tenantId")
    List<Job> findJobsAssignedToTechnician(@Param("technicianId") Long technicianId,
                                           @Param("tenantId") Long tenantId);
}