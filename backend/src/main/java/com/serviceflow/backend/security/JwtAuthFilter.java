package com.serviceflow.backend.security;

import com.serviceflow.backend.repository.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            try {
                Claims claims = jwtService.parseToken(token);

                Long userId = Long.valueOf(claims.getSubject());

                // tenantId is absent for PLATFORM_ADMIN tokens
                Object rawTenantId = claims.get("tenantId");
                Long tenantId = (rawTenantId instanceof Number n) ? n.longValue() : null;

                String role = String.valueOf(claims.get("role"));

                boolean isPlatformAdmin = "PLATFORM_ADMIN".equals(role);

                // Company users must still be active (and so must their company)
                boolean stillActive = isPlatformAdmin
                        || userRepository.countActiveUserWithActiveTenant(userId) > 0;

                if (stillActive) {
                    AuthenticatedUser principal = new AuthenticatedUser(userId, tenantId, role);

                    var authToken = new UsernamePasswordAuthenticationToken(
                            principal,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + role))
                    );

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    log.info("Rejected token for deactivated user {}", userId);
                }

            } catch (Exception ex) {
                // invalid/expired token: leave the request unauthenticated
                log.warn("JWT rejected for {}: {}", request.getRequestURI(), ex.toString());
            }
        }

        filterChain.doFilter(request, response);
    }
}