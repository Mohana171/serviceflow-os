import { api } from "./apiClient";

export const getUserTerritories = (userId) => api.get(`/user-territories/user/${userId}`);
export const assignTerritory    = (data)   => api.post("/user-territories", data);