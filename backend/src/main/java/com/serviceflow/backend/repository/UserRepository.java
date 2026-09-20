package com.serviceflow.backend.repository;
import com.serviceflow.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long> {
    List<User> findByTenantId(Long tenantId);
    Optional<User> findByTenantIdAndEmail(Long tenantId, String email);
    boolean existsByTenantIdAndEmail(Long tenantId, String email);
    List<User> findByTenantIdAndRole(Long tenantId, String role);
}