import { api } from "./apiClient";

export const getCustomers    = ()     => api.get("/customers");
export const getCustomerById = (id)   => api.get(`/customers/${id}`);
export const createCustomer  = (data) => api.post("/customers", data);