import { api } from "./apiClient";

export function login(tenantId, email, password) {
    return api.post("/auth/login", { tenantId, email, password }).then((data) => {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("authUser", JSON.stringify({
            userId: data.userId,
            tenantId: data.tenantId,
            role: data.role,
            fullName: data.fullName,
        }));
        return data;
    });
}

export function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
}

export function getCurrentUser() {
    const raw = localStorage.getItem("authUser");
    return raw ? JSON.parse(raw) : null;
}

export function isLoggedIn() {
    return !!localStorage.getItem("authToken");
}