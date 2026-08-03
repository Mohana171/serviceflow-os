import { useEffect, useState } from "react";

import {
    createTenant,
    deactivateTenant,
    getTenantById,
    getTenants,
    updateTenant
} from "../services/tenantService";

function TenantsPage() {
    const [tenants, setTenants] = useState([]);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [searchId, setSearchId] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        timezone: ""
    });

    useEffect(() => {
        loadAllTenants();
    }, []);

    async function loadAllTenants(showSuccessMessage = false) {
        try {
            setError("");

            const data = await getTenants();
            setTenants(data);

            if (showSuccessMessage) {
                setMessage("All active tenants loaded successfully.");
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleGetAll() {
        setMessage("");
        setLoading(true);

        await loadAllTenants(true);
    }

    async function handleGetById() {
        if (!searchId.trim()) {
            setError("Enter a tenant ID.");
            setMessage("");
            return;
        }

        try {
            setError("");
            setMessage("");

            const tenant = await getTenantById(searchId);

            setTenants([tenant]);
            setMessage(
                `Tenant ${searchId} loaded successfully.`
            );
        } catch (error) {
            setError(error.message);
        }
    }

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((currentFormData) => ({
            ...currentFormData,
            [name]: value
        }));
    }

    function handleAddClick() {
        setEditingId(null);

        setFormData({
            name: "",
            timezone: ""
        });

        setShowForm(true);
        setError("");
        setMessage("");
    }

    function handleEditClick(tenant) {
        setEditingId(tenant.id);

        setFormData({
            name: tenant.name,
            timezone: tenant.timezone
        });

        setShowForm(true);
        setError("");
        setMessage("");
    }

    function handleCancel() {
        setShowForm(false);
        setEditingId(null);

        setFormData({
            name: "",
            timezone: ""
        });

        setError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const cleanedTenantData = {
            name: formData.name.trim(),
            timezone: formData.timezone.trim()
        };

        if (
            !cleanedTenantData.name ||
            !cleanedTenantData.timezone
        ) {
            setError(
                "Tenant name and timezone are required."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            if (editingId !== null) {
                await updateTenant(
                    editingId,
                    cleanedTenantData
                );

                await loadAllTenants();

                setMessage(
                    "Tenant updated successfully."
                );
            } else {
                await createTenant(cleanedTenantData);

                await loadAllTenants();

                setMessage(
                    "Tenant created successfully."
                );
            }

            setShowForm(false);
            setEditingId(null);

            setFormData({
                name: "",
                timezone: ""
            });
        } catch (error) {
            setError(error.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDeactivate(tenant) {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate "${tenant.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setMessage("");

            await deactivateTenant(tenant.id);

            await loadAllTenants();

            setMessage(
                "Tenant deactivated successfully."
            );
        } catch (error) {
            setError(error.message);
        }
    }

    if (loading) {
        return (
            <section>
                <h2>Tenants</h2>
                <p>Loading tenants...</p>
            </section>
        );
    }

    return (
        <section>
            <h2>Tenants</h2>

            <p>
                Manage companies using ServiceFlow.
            </p>

            <div>
                <button
                    type="button"
                    onClick={handleGetAll}
                >
                    Get All Tenants
                </button>

                <input
                    type="number"
                    value={searchId}
                    onChange={(event) =>
                        setSearchId(event.target.value)
                    }
                    placeholder="Tenant ID"
                    min="1"
                />

                <button
                    type="button"
                    onClick={handleGetById}
                >
                    Get Tenant by ID
                </button>

                <button
                    type="button"
                    onClick={handleAddClick}
                >
                    Add Tenant
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit}>
                    <h3>
                        {editingId !== null
                            ? "Update Tenant"
                            : "Add Tenant"}
                    </h3>

                    <div>
                        <label htmlFor="name">
                            Tenant Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={saving}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="timezone">
                            Timezone
                        </label>

                        <input
                            id="timezone"
                            name="timezone"
                            type="text"
                            value={formData.timezone}
                            onChange={handleChange}
                            placeholder="America/New_York"
                            disabled={saving}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : editingId !== null
                              ? "Update Tenant"
                              : "Save Tenant"}
                    </button>

                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                </form>
            )}

            {message && (
                <p>{message}</p>
            )}

            {error && (
                <p>{error}</p>
            )}

            {tenants.length === 0 ? (
                <p>No active tenants found.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Timezone</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {tenants.map((tenant) => (
                            <tr key={tenant.id}>
                                <td>{tenant.id}</td>

                                <td>{tenant.name}</td>

                                <td>{tenant.timezone}</td>

                                <td>
                                    {tenant.active
                                        ? "Active"
                                        : "Inactive"}
                                </td>

                                <td>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleEditClick(
                                                tenant
                                            )
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeactivate(
                                                tenant
                                            )
                                        }
                                    >
                                        Deactivate
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    );
}

export default TenantsPage;