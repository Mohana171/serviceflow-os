const TENANT_API_URL = "http://localhost:8080/api/tenants";

async function handleJsonResponse(response, defaultMessage) {
    if (!response.ok) {
        let message = defaultMessage;

        try {
            const errorData = await response.json();

            if (errorData.message) {
                message = errorData.message;
            }
        } catch {
            // Use the default message if the response is not JSON.
        }

        throw new Error(message);
    }

    return response.json();
}

export async function getTenants() {
    const response = await fetch(TENANT_API_URL);

    return handleJsonResponse(
        response,
        "Failed to fetch tenants"
    );
}

export async function getTenantById(id) {
    const response = await fetch(
        `${TENANT_API_URL}/${id}`
    );

    return handleJsonResponse(
        response,
        "Tenant not found"
    );
}

export async function createTenant(tenantData) {
    const response = await fetch(TENANT_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(tenantData)
    });

    return handleJsonResponse(
        response,
        "Failed to create tenant"
    );
}

export async function updateTenant(id, tenantData) {
    const response = await fetch(
        `${TENANT_API_URL}/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(tenantData)
        }
    );

    return handleJsonResponse(
        response,
        "Failed to update tenant"
    );
}

export async function deactivateTenant(id) {
    const response = await fetch(
        `${TENANT_API_URL}/${id}`,
        {
            method: "DELETE"
        }
    );

    if (!response.ok) {
        let message = "Failed to deactivate tenant";

        try {
            const errorData = await response.json();

            if (errorData.message) {
                message = errorData.message;
            }
        } catch {
            // DELETE returns no JSON body when successful.
        }

        throw new Error(message);
    }
}