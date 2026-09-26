package com.serviceflow.backend.repository;

import com.serviceflow.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByTenantId(Long tenantId);
    Optional<User> findByTenantIdAndEmail(Long tenantId, String email);
    boolean existsByTenantIdAndEmail(Long tenantId, String email);
    boolean existsByTenantIdAndEmailAndIdNot(Long tenantId, String email, Long id);
    List<User> findByTenantIdAndRole(Long tenantId, String role);

    // 1 if the user AND their company are both active, otherwise 0
    @Query("select count(u) from User u where u.id = :id and u.active = true and u.tenant.active = true")
    long countActiveUserWithActiveTenant(@Param("id") Long id);
}