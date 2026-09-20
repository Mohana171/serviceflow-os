import { api } from "./apiClient";

export const getUserSchedule = (userId) => api.get(`/schedules/user/${userId}`);
export const createSchedule  = (data)   => api.post("/schedules", data);