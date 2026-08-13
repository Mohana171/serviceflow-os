package com.serviceflow.backend.repository;

import com.serviceflow.backend.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SkillRepository extends JpaRepository<Skill, Long> {

    List<Skill> findByTenantIdAndActiveTrue(Long tenantId);

    boolean existsByIdAndTenantId(Long id, Long tenantId);
}