import { api } from "./apiClient";

export const getUsers        = ()         => api.get("/users");
export const getUserById     = (id)       => api.get(`/users/${id}`);
export const createUser      = (data)     => api.post("/users", data);
export const updateUser      = (id, data) => api.put(`/users/${id}`, data);
export const deactivateUser  = (id)       => api.del(`/users/${id}`);
export const reactivateUser  = (id)       => api.patch(`/users/${id}/reactivate`);