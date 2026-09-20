import { api } from "./apiClient";

export const getNotesForJob = (jobId) => api.get(`/notes/job/${jobId}`);
export const createNote     = (data)  => api.post("/notes", data);