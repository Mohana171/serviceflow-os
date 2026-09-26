const BASE_URL = "http://localhost:8080/api";

async function request(path, options = {}) {
    const isPlatformPath = path.startsWith("/tenants") || path.startsWith("/platform");
    const token = localStorage.getItem(isPlatformPath ? "platformToken" : "authToken");

    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${BASE_URL}${path}`, {
        headers,
        ...options,
    });

    if (!response.ok) {
        let message = `Request failed (${response.status})`;
        try {
            const errorData = await response.json();
            if (errorData.message) message = errorData.message;
        } catch {
            // response had no JSON body
        }
        throw new Error(message);
    }

    if (response.status === 204) return null;
    return response.json();
}

export const api = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
    put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
    patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
    del: (path) => request(path, { method: "DELETE" }),
};