package com.serviceflow.backend.service;

import com.serviceflow.backend.dto.CustomerRequest;
import com.serviceflow.backend.dto.CustomerResponse;
import com.serviceflow.backend.entity.Customer;
import com.serviceflow.backend.entity.Tenant;
import com.serviceflow.backend.exception.ResourceNotFoundException;
import com.serviceflow.backend.repository.CustomerRepository;
import com.serviceflow.backend.repository.TenantRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final TenantRepository tenantRepository;

    public CustomerService(CustomerRepository customerRepository, TenantRepository tenantRepository) {
        this.customerRepository = customerRepository;
        this.tenantRepository = tenantRepository;
    }

    public CustomerResponse createCustomer(CustomerRequest request, Long tenantId) {

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        Customer customer = new Customer();
        customer.setTenant(tenant);
        customer.setName(request.getName().trim());
        customer.setPrimaryPhone(request.getPrimaryPhone());
        customer.setEmail(request.getEmail());
        customer.setActive(true);

        Customer saved = customerRepository.save(customer);

        return mapToResponse(saved);
    }

    public List<CustomerResponse> getCustomersForTenant(Long tenantId) {

        return customerRepository.findByTenantIdAndActiveTrue(tenantId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CustomerResponse getCustomerById(Long id, Long requestingTenantId) {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (!customer.getTenant().getId().equals(requestingTenantId)) {
            throw new ResourceNotFoundException("Customer not found");
        }

        return mapToResponse(customer);
    }

    public CustomerResponse updateCustomer(Long id, CustomerRequest request, Long requestingTenantId) {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (!customer.getTenant().getId().equals(requestingTenantId)) {
            throw new ResourceNotFoundException("Customer not found");
        }

        customer.setName(request.getName().trim());
        customer.setPrimaryPhone(request.getPrimaryPhone());
        customer.setEmail(request.getEmail());

        Customer saved = customerRepository.save(customer);

        return mapToResponse(saved);
    }

    private CustomerResponse mapToResponse(Customer customer) {

        CustomerResponse response = new CustomerResponse();
        response.setId(customer.getId());
        response.setTenantId(customer.getTenant().getId());
        response.setName(customer.getName());
        response.setPrimaryPhone(customer.getPrimaryPhone());
        response.setEmail(customer.getEmail());
        response.setActive(customer.isActive());
        response.setCreatedAt(customer.getCreatedAt());
        response.setUpdatedAt(customer.getUpdatedAt());

        return response;
    }
}