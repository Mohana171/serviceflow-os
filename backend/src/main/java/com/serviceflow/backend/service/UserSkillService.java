package com.serviceflow.backend.service;

import com.serviceflow.backend.exception.ForbiddenActionException;
import com.serviceflow.backend.dto.UserSkillResponse;
import com.serviceflow.backend.entity.Skill;
import com.serviceflow.backend.entity.User;
import com.serviceflow.backend.entity.UserSkill;
import com.serviceflow.backend.exception.DuplicateResourceException;
import com.serviceflow.backend.exception.ResourceNotFoundException;
import com.serviceflow.backend.repository.SkillRepository;
import com.serviceflow.backend.repository.UserRepository;
import com.serviceflow.backend.repository.UserSkillRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserSkillService {

    private static final String ROLE_DISPATCHER = "DISPATCHER";
    private static final String ROLE_TECHNICIAN = "TECHNICIAN";

    private final UserSkillRepository userSkillRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;

    public UserSkillService(
            UserSkillRepository userSkillRepository,
            UserRepository userRepository,
            SkillRepository skillRepository
    ) {
        this.userSkillRepository = userSkillRepository;
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
    }

    public UserSkillResponse assignSkillToUser(Long userId, Long skillId, Long requestingTenantId, String requestingRole) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getTenant().getId().equals(requestingTenantId)) {
            throw new ResourceNotFoundException("User not found");
        }

        requireCanManageSkillsFor(user, requestingRole);

        boolean skillBelongsToTenant = skillRepository.existsByIdAndTenantId(skillId, requestingTenantId);
        if (!skillBelongsToTenant) {
            throw new ResourceNotFoundException("Skill not found");
        }

        if (userSkillRepository.existsByUserIdAndSkillId(userId, skillId)) {
            throw new DuplicateResourceException("User already has this skill");
        }

        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found"));

        UserSkill userSkill = new UserSkill(user, skill);
        UserSkill saved = userSkillRepository.save(userSkill);

        return mapToResponse(saved);
    }

    public List<UserSkillResponse> getSkillsForUser(Long userId, Long requestingTenantId, String requestingRole) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getTenant().getId().equals(requestingTenantId)) {
            throw new ResourceNotFoundException("User not found");
        }

        requireCanManageSkillsFor(user, requestingRole);

        return userSkillRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void requireCanManageSkillsFor(User targetUser, String requestingRole) {
        if (ROLE_DISPATCHER.equalsIgnoreCase(requestingRole)
                && !ROLE_TECHNICIAN.equalsIgnoreCase(targetUser.getRole())) {
            throw new ForbiddenActionException("Dispatchers can only manage skills for technicians");
        }
    }

    private UserSkillResponse mapToResponse(UserSkill userSkill) {
        UserSkillResponse response = new UserSkillResponse();
        response.setUserId(userSkill.getUser().getId());
        response.setUserFullName(userSkill.getUser().getFullName());
        response.setSkillId(userSkill.getSkill().getId());
        response.setSkillName(userSkill.getSkill().getName());
        response.setCreatedAt(userSkill.getCreatedAt());
        return response;
    }
}