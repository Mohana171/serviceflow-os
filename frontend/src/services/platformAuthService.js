import { api } from "./apiClient";

export function platformLogin(username, password) {
    return api.post("/platform/login", { username, password }).then((data) => {
        localStorage.setItem("platformToken", data.token);
        localStorage.setItem("platformUser", data.username);
        return data;
    });
}

export function platformLogout() {
    localStorage.removeItem("platformToken");
    localStorage.removeItem("platformUser");
}

export function getPlatformUser() {
    return localStorage.getItem("platformUser");
}

export function isPlatformLoggedIn() {
    return !!localStorage.getItem("platformToken");
}