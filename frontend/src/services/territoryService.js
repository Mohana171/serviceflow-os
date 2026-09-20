import { api } from "./apiClient";

export const getTerritories   = ()     => api.get("/territories");
export const createTerritory  = (data) => api.post("/territories", data);