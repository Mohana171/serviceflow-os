import { api } from "./apiClient";

export const getCustomers    = ()          => api.get("/customers");
export const getCustomerById = (id)        => api.get(`/customers/${id}`);
export const createCustomer  = (data)      => api.post("/customers", data);
export const updateCustomer  = (id, data)  => api.put(`/customers/${id}`, data);