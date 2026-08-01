import { useEffect, useState } from "react";
import {
    createTenant,
    getTenants
} from "../services/tenantService";

function TenantsPage() {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        timezone: ""
    });

    useEffect(() => {
        async function loadTenants() {
            try {
                const data = await getTenants();
                setTenants(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadTenants();
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setError("");

            const createdTenant = await createTenant(formData);

            setTenants([...tenants, createdTenant]);

            setFormData({
                name: "",
                timezone: ""
            });

            setShowForm(false);
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
            <div>
                <h2>Tenants</h2>
                <p>Manage companies using ServiceFlow.</p>
            </div>

            <button
                type="button"
                onClick={() => setShowForm(!showForm)}
            >
                {showForm ? "Cancel" : "Add Tenant"}
            </button>

            {showForm && (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name">Tenant Name</label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter tenant name"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="timezone">Timezone</label>

                        <input
                            id="timezone"
                            name="timezone"
                            type="text"
                            value={formData.timezone}
                            onChange={handleChange}
                            placeholder="America/New_York"
                            required
                        />
                    </div>

                    <button type="submit">
                        Save Tenant
                    </button>
                </form>
            )}

            {error && <p>{error}</p>}

            {tenants.length === 0 ? (
                <p>No tenants found.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Timezone</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {tenants.map((tenant) => (
                            <tr key={tenant.id}>
                                <td>{tenant.name}</td>
                                <td>{tenant.timezone}</td>
                                <td>
                                    {tenant.active
                                        ? "Active"
                                        : "Inactive"}
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