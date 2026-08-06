import { useState, useEffect } from "react";
import { getUsers, createUser } from "../services/userService";
import { getCurrentUser } from "../services/authService";

const ROLES = ["ADMIN", "DISPATCHER", "TECHNICIAN"];

const EMPTY_FORM = { fullName: "", email: "", password: "", role: "TECHNICIAN" };

function UsersPage() {
  const currentUser = getCurrentUser(); // { userId, tenantId, role, fullName }

  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function loadUsers() {
    setLoading(true);
    setError("");
    getUsers()
      .then((data) => setUsers(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const newUser = {
      tenantId: currentUser.tenantId,
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
        loadUsers();
      })
      .catch((err) => setError(err.message));
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Users</h2>
      <p>Showing users for: <strong>{currentUser?.fullName}'s company</strong></p>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
      {loading && <p>Loading users...</p>}

      <button onClick={() => setShowForm((s) => !s)}>
        {showForm ? "Cancel" : "Add User"}
      </button>

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
            <tr><td colSpan="5">No users yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UsersPage;