import { api } from "./apiClient";

export const getTenants        = ()        => api.get("/tenants");
export const getTenantById     = (id)      => api.get(`/tenants/${id}`);
export const createTenant      = (data)    => api.post("/tenants", data);
export const updateTenant      = (id, data)=> api.put(`/tenants/${id}`, data);
export const deactivateTenant  = (id)      => api.del(`/tenants/${id}`);