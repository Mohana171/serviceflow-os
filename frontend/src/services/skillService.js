import { api } from "./apiClient";

export const getSkills   = ()     => api.get("/skills");
export const createSkill = (data) => api.post("/skills", data);