package com.serviceflow.backend.service;

import com.serviceflow.backend.dto.LocationRequest;
import com.serviceflow.backend.dto.LocationResponse;
import com.serviceflow.backend.entity.Customer;
import com.serviceflow.backend.entity.Location;
import com.serviceflow.backend.entity.Tenant;
import com.serviceflow.backend.exception.ResourceNotFoundException;
import com.serviceflow.backend.repository.CustomerRepository;
import com.serviceflow.backend.repository.LocationRepository;
import com.serviceflow.backend.repository.TenantRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LocationService {

    private final LocationRepository locationRepository;
    private final CustomerRepository customerRepository;
    private final TenantRepository tenantRepository;

    public LocationService(
            LocationRepository locationRepository,
            CustomerRepository customerRepository,
            TenantRepository tenantRepository
    ) {
        this.locationRepository = locationRepository;
        this.customerRepository = customerRepository;
        this.tenantRepository = tenantRepository;
    }

    public LocationResponse createLocation(LocationRequest request, Long tenantId) {

        // Two-level check: does the customer exist, AND belong to this tenant?
        boolean customerBelongsToTenant = customerRepository.existsByIdAndTenantId(
                request.getCustomerId(), tenantId
        );

        if (!customerBelongsToTenant) {
            throw new ResourceNotFoundException("Customer not found");
        }

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Location location = new Location();
        location.setTenant(tenant);
        location.setCustomer(customer);
        location.setAddressLine1(request.getAddressLine1().trim());
        location.setCity(request.getCity().trim());
        location.setState(request.getState().trim());
        location.setZip(request.getZip().trim());
        location.setActive(true);

        Location saved = locationRepository.save(location);

        return mapToResponse(saved);
    }

    public List<LocationResponse> getLocationsForCustomer(Long customerId, Long requestingTenantId) {

        boolean customerBelongsToTenant = customerRepository.existsByIdAndTenantId(
                customerId, requestingTenantId
        );

        if (!customerBelongsToTenant) {
            throw new ResourceNotFoundException("Customer not found");
        }

        return locationRepository.findByCustomerIdAndActiveTrue(customerId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private LocationResponse mapToResponse(Location location) {

        LocationResponse response = new LocationResponse();
        response.setId(location.getId());
        response.setTenantId(location.getTenant().getId());
        response.setCustomerId(location.getCustomer().getId());
        response.setAddressLine1(location.getAddressLine1());
        response.setCity(location.getCity());
        response.setState(location.getState());
        response.setZip(location.getZip());
        response.setActive(location.isActive());
        response.setCreatedAt(location.getCreatedAt());
        response.setUpdatedAt(location.getUpdatedAt());

        return response;
    }
}