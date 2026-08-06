import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

function LoginPage() {
    const [tenantId, setTenantId] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        try {
            await login(Number(tenantId), email, password);
            navigate("/tenants");
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div style={{ maxWidth: 320, margin: "40px auto" }}>
            <h2>Log in</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Tenant ID</label>
                    <input type="number" value={tenantId} onChange={(e) => setTenantId(e.target.value)} required />
                </div>
                <div>
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <button type="submit">Log in</button>
            </form>
        </div>
    );
}

export default LoginPage;