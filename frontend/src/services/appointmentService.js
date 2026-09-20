import { api } from "./apiClient";

export const getAppointmentsForJob = (jobId) => api.get(`/appointments/job/${jobId}`);
export const createAppointment     = (data)  => api.post("/appointments", data);