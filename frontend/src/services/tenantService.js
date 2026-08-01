const TENANT_API_URL = "http://localhost:8080/api/tenants";

export async function getTenants() {
    const response = await fetch(TENANT_API_URL);

    if (!response.ok) {
        throw new Error("Failed to fetch tenants");
    }

    return response.json();
}

export async function createTenant(tenantData) {
    const response = await fetch(TENANT_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(tenantData)
    });

    if (!response.ok) {
        throw new Error("Failed to create tenant");
    }

    return response.json();
}