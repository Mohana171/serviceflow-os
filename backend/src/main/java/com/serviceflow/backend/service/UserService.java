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
import com.serviceflow.backend.dto.UserUpdateRequest;
import com.serviceflow.backend.exception.ForbiddenActionException;
import java.util.Map;
import java.util.Set;

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

    public UserResponse createUser(UserRequest request, Long requestingTenantId) {

        Tenant tenant = tenantRepository.findById(requestingTenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        String normalizedEmail = request.getEmail()
                .trim()
                .toLowerCase();

        if (userRepository.existsByTenantIdAndEmail(
            requestingTenantId, normalizedEmail
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
    // Who may manage which roles. Owner (platform) creates ADMINs separately.
    private static final Map<String, Set<String>> MANAGEABLE_ROLES = Map.of(
        "ADMIN", Set.of("DISPATCHER", "TECHNICIAN"),
        "DISPATCHER", Set.of("TECHNICIAN")
    );

    private void requireCanManage(String requesterRole, String targetRole) {
    if (!MANAGEABLE_ROLES.getOrDefault(requesterRole, Set.of()).contains(targetRole)) {
        throw new ForbiddenActionException(
                "You are not allowed to manage " + targetRole + " accounts");
    }
    }

    private User findManageableUser(Long id, Long requestingTenantId, String requesterRole) {
    User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    if (!user.getTenant().getId().equals(requestingTenantId)) {
        throw new ResourceNotFoundException("User not found");
    }

    requireCanManage(requesterRole, user.getRole());
    return user;
    }

    public UserResponse createUserAsStaff(UserRequest request, Long requestingTenantId, String requesterRole) {
    requireCanManage(requesterRole, request.getRole().trim().toUpperCase());
    return createUser(request, requestingTenantId);
    }

    public UserResponse updateUser(Long id, UserUpdateRequest request,
                            Long requestingTenantId, String requesterRole) {

    User user = findManageableUser(id, requestingTenantId, requesterRole);

    String normalizedEmail = request.getEmail().trim().toLowerCase();

    if (userRepository.existsByTenantIdAndEmailAndIdNot(requestingTenantId, normalizedEmail, id)) {
        throw new DuplicateResourceException("User email already exists for this tenant");
    }

    user.setFullName(request.getFullName().trim());
    user.setEmail(normalizedEmail);

    if (request.getPassword() != null && !request.getPassword().isBlank()) {
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    }

    return mapToResponse(userRepository.save(user));
    }

    public UserResponse setUserActive(Long id, boolean active,
                                Long requestingTenantId, String requesterRole) {

    User user = findManageableUser(id, requestingTenantId, requesterRole);
    user.setActive(active);
    return mapToResponse(userRepository.save(user));
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