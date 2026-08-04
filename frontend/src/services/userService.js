import { api } from "./apiClient";

export const getUsersByTenant = (tenantId) => api.get(`/users/tenant/${tenantId}`);
export const getUserById      = (id)       => api.get(`/users/${id}`);
export const createUser       = (data)     => api.post("/users", data);