import { api } from "./apiClient";

export const getLocationsForCustomer = (customerId) => api.get(`/locations/customer/${customerId}`);
export const createLocation          = (data)       => api.post("/locations", data);