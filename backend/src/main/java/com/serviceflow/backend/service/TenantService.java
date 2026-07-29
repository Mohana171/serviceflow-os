package com.serviceflow.backend.service;
import com.serviceflow.backend.dto.TenantRequest;
import com.serviceflow.backend.dto.TenantResponse;
import com.serviceflow.backend.entity.Tenant;
import com.serviceflow.backend.exception.DuplicateResourceException;
import com.serviceflow.backend.exception.ResourceNotFoundException;
import com.serviceflow.backend.repository.TenantRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TenantService {
    private final TenantRepository tenantRepository;
    public TenantService(TenantRepository tenantRepository){
        this.tenantRepository=tenantRepository;
    }
    public TenantResponse createTenant (TenantRequest request){
        String name=request.getName().trim();
        String timezone=request.getTimezone().trim();
        if(tenantRepository.existsByNameIgnoreCase(name)){
            throw new DuplicateResourceException("Tenant already exists");
        }
        Tenant tenant=new Tenant();
        tenant.setName(name);
        tenant.setTimezone(timezone);
        Tenant savedTenant=tenantRepository.save(tenant);
        return toResponse(savedTenant);
    }
    private TenantResponse toResponse(Tenant tenant){
        TenantResponse response=new TenantResponse();
        response.setId(tenant.getId());
        response.setName(tenant.getName());
        response.setTimezone(tenant.getTimezone());
        response.setActive(tenant.getActive());
        response.setCreatedAt(tenant.getCreatedAt());
        response.setUpdatedAt(tenant.getUpdatedAt());
        return response;        
    }
    public List<TenantResponse> getAllTenants(){
        List <Tenant> tenants=tenantRepository.findByActiveTrue();
        return tenants.stream()
            .map(this::toResponse)
            .toList();
    }
    public TenantResponse getTenantById(Long id){
        Tenant tenant=tenantRepository .findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("tenant not found"));
        return toResponse(tenant);
    }
    public TenantResponse updateTenant(Long id, TenantRequest request) {

        Tenant tenant = tenantRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));
        String name = request.getName().trim();
        String timezone = request.getTimezone().trim();
        if (tenantRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new DuplicateResourceException("Tenant name already exists");
        }
        tenant.setName(name);
        tenant.setTimezone(timezone);
        Tenant updatedTenant = tenantRepository.save(tenant);
        return toResponse(updatedTenant);
    }
    public void deleteTenant(Long id) {

        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));
        if (tenant.getActive()) {
            tenant.setActive(false);
            tenantRepository.save(tenant);
        }
    }
}
