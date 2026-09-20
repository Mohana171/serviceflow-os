import { api } from "./apiClient";

export const getUserSkills = (userId) => api.get(`/user-skills/user/${userId}`);
export const assignSkill   = (data)   => api.post("/user-skills", data);