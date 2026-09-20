import { api } from "./apiClient";

export const getJobs                 = ()              => api.get("/jobs");
export const getJobById              = (id)            => api.get(`/jobs/${id}`);
export const createJob               = (data)          => api.post("/jobs", data);
export const updateJobStatus         = (id, status)    => api.patch(`/jobs/${id}/status`, { status });
export const getSuggestedTechnicians = (jobId)         => api.get(`/jobs/${jobId}/suggested-technicians`);