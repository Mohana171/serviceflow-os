import { api } from "./apiClient";

export const getUsers    = ()     => api.get("/users");
export const getUserById = (id)   => api.get(`/users/${id}`);
export const createUser  = (data) => api.post("/users", data);