import { api } from "./apiClient";

export const getLocationsForCustomer = (customerId)     => api.get(`/locations/customer/${customerId}`);
export const createLocation          = (data)           => api.post("/locations", data);
export const updateLocation          = (id, data)       => api.put(`/locations/${id}`, data);
export const deactivateLocation      = (id)             => api.del(`/locations/${id}`);