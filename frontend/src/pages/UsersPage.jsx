import { useState, useEffect } from "react";
import { getTenants } from "../services/tenantService";
import { getUsersByTenant, createUser } from "../services/userService";

const ROLES = ["ADMIN", "DISPATCHER", "TECHNICIAN"];

const EMPTY_FORM = { fullName: "", email: "", password: "", role: "TECHNICIAN" };

function UsersPage() {
  // ---- data ----
  const [tenants, setTenants] = useState([]);        // for the dropdown
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [users, setUsers] = useState([]);            // users of the selected tenant

  // ---- ui state ----
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // 1. Load the tenant list once, when the page opens
  useEffect(() => {
    getTenants()
      .then((data) => setTenants(data))
      .catch((err) => setError(err.message));
  }, []);

  // 2. Whenever a tenant is selected, load that tenant's users
  useEffect(() => {
    if (!selectedTenantId) {
      setUsers([]);
      return;
    }
    setLoading(true);
    setError("");
    getUsersByTenant(selectedTenantId)
      .then((data) => setUsers(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedTenantId]);

  // ---- handlers ----
  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const newUser = {
      tenantId: Number(selectedTenantId),
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: formData.role,
    };

    createUser(newUser)
      .then(() => {
        setMessage("User created successfully");
        setFormData(EMPTY_FORM);
        setShowForm(false);
        return getUsersByTenant(selectedTenantId); // refresh the list
      })
      .then((data) => setUsers(data))
      .catch((err) => setError(err.message));
  }

  // ---- render ----
  return (
    <div style={{ padding: "20px" }}>
      <h2>Users</h2>

      {/* Tenant selector */}
      <div style={{ marginBottom: "16px" }}>
        <label>Company (tenant): </label>
        <select
          value={selectedTenantId}
          onChange={(e) => setSelectedTenantId(e.target.value)}
        >
          <option value="">-- Select a tenant --</option>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
      {loading && <p>Loading users...</p>}

      {/* Only show table + add button once a tenant is chosen */}
      {selectedTenantId && (
        <>
          <button onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "Add User"}
          </button>

          {/* Add-user form */}
          {showForm && (
            <form onSubmit={handleSubmit} style={{ marginTop: "12px" }}>
              <input
                name="fullName"
                placeholder="Full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <select name="role" value={formData.role} onChange={handleChange}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <button type="submit">Save User</button>
            </form>
          )}

          {/* Users table */}
          <table border="1" cellPadding="6" style={{ marginTop: "16px" }}>
            <thead>
              <tr>
                <th>ID</th><th>Full Name</th><th>Email</th><th>Role</th><th>Active</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.active ? "Yes" : "No"}</td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr><td colSpan="5">No users for this tenant yet.</td></tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default UsersPage;