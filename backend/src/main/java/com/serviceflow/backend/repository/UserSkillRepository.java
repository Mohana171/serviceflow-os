package com.serviceflow.backend.repository;

import com.serviceflow.backend.entity.UserSkill;
import com.serviceflow.backend.entity.UserSkillId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserSkillRepository extends JpaRepository<UserSkill, UserSkillId> {

    List<UserSkill> findByUserId(Long userId);

    boolean existsByUserIdAndSkillId(Long userId, Long skillId);
}