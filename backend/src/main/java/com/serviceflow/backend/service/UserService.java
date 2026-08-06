package com.serviceflow.backend.service;

import com.serviceflow.backend.dto.UserRequest;
import com.serviceflow.backend.dto.UserResponse;
import com.serviceflow.backend.entity.Tenant;
import com.serviceflow.backend.entity.User;
import com.serviceflow.backend.exception.DuplicateResourceException;
import com.serviceflow.backend.exception.ResourceNotFoundException;
import com.serviceflow.backend.repository.TenantRepository;
import com.serviceflow.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            TenantRepository tenantRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse createUser(UserRequest request) {

        Tenant tenant = tenantRepository.findById(request.getTenantId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Tenant not found")
                );

        String normalizedEmail = request.getEmail()
                .trim()
                .toLowerCase();

        if (userRepository.existsByTenantIdAndEmail(
                request.getTenantId(),
                normalizedEmail
        )) {
            throw new DuplicateResourceException(
                    "User email already exists for this tenant"
            );
        }

        User user = new User();

        user.setTenant(tenant);
        user.setFullName(request.getFullName().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole().trim().toUpperCase());
        user.setActive(true);

        User savedUser = userRepository.save(user);

        return mapToResponse(savedUser);
    }

    public List<UserResponse> getUsersVisibleToRequester(
            Long tenantId,
            Long requestingUserId,
            String requestingRole
    ) {
        if (!tenantRepository.existsById(tenantId)) {
            throw new ResourceNotFoundException("Tenant not found");
        }

        return userRepository.findByTenantId(tenantId)
                .stream()
                .filter(user -> canView(requestingRole, requestingUserId, user))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(
            Long id,
            Long requestingTenantId,
            Long requestingUserId,
            String requestingRole
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        boolean sameTenant = user.getTenant().getId().equals(requestingTenantId);

        if (!sameTenant || !canView(requestingRole, requestingUserId, user)) {
            throw new ResourceNotFoundException("User not found");
        }

        return mapToResponse(user);
    }

    private boolean canView(String requestingRole, Long requestingUserId, User target) {

        if ("ADMIN".equals(requestingRole)) {
            return true;
        }

        if ("DISPATCHER".equals(requestingRole)) {
            return "TECHNICIAN".equals(target.getRole())
                    || target.getId().equals(requestingUserId);
        }

        // TECHNICIAN (or any other/unknown role) — only themselves
        return target.getId().equals(requestingUserId);
    }

    private UserResponse mapToResponse(User user) {

        UserResponse response = new UserResponse();

        response.setId(user.getId());
        response.setTenantId(user.getTenant().getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setActive(user.isActive());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());

        return response;
    }
}