package com.serviceflow.backend.service;

import com.serviceflow.backend.dto.LocationRequest;
import com.serviceflow.backend.dto.LocationResponse;
import com.serviceflow.backend.entity.Customer;
import com.serviceflow.backend.entity.Location;
import com.serviceflow.backend.entity.Tenant;
import com.serviceflow.backend.entity.Territory;
import com.serviceflow.backend.exception.ResourceNotFoundException;
import com.serviceflow.backend.repository.CustomerRepository;
import com.serviceflow.backend.repository.LocationRepository;
import com.serviceflow.backend.repository.TenantRepository;
import com.serviceflow.backend.repository.TerritoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LocationService {

    private final LocationRepository locationRepository;
    private final CustomerRepository customerRepository;
    private final TenantRepository tenantRepository;
    private final TerritoryRepository territoryRepository;

    public LocationService(
            LocationRepository locationRepository,
            CustomerRepository customerRepository,
            TenantRepository tenantRepository,
            TerritoryRepository territoryRepository
    ) {
        this.locationRepository = locationRepository;
        this.customerRepository = customerRepository;
        this.tenantRepository = tenantRepository;
        this.territoryRepository = territoryRepository;
    }

    public LocationResponse createLocation(LocationRequest request, Long tenantId) {

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

        if (request.getTerritoryId() != null) {
            Territory territory = territoryRepository.findById(request.getTerritoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Territory not found"));

            if (!territory.getTenant().getId().equals(tenantId)) {
                throw new ResourceNotFoundException("Territory not found");
            }

            location.setTerritory(territory);
        }

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

    public LocationResponse updateLocation(Long id, LocationRequest request, Long requestingTenantId) {

        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found"));

        if (!location.getTenant().getId().equals(requestingTenantId)) {
            throw new ResourceNotFoundException("Location not found");
        }

        location.setAddressLine1(request.getAddressLine1().trim());
        location.setCity(request.getCity().trim());
        location.setState(request.getState().trim());
        location.setZip(request.getZip().trim());

        if (request.getTerritoryId() != null) {
            Territory territory = territoryRepository.findById(request.getTerritoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Territory not found"));

            if (!territory.getTenant().getId().equals(requestingTenantId)) {
                throw new ResourceNotFoundException("Territory not found");
            }

            location.setTerritory(territory);
        } else {
            location.setTerritory(null);
        }

        Location saved = locationRepository.save(location);

        return mapToResponse(saved);
    }

    public void deactivateLocation(Long locationId, Long requestingTenantId) {

        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found"));

        if (!location.getTenant().getId().equals(requestingTenantId)) {
            throw new ResourceNotFoundException("Location not found");
        }

        location.setActive(false);
        locationRepository.save(location);
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

        if (location.getTerritory() != null) {
            response.setTerritoryId(location.getTerritory().getId());
            response.setTerritoryName(location.getTerritory().getName());
        }

        return response;
    }
}