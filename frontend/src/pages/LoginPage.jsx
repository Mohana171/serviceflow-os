import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
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
        <Box sx={{ maxWidth: 360, margin: "60px auto" }}>
            <Paper elevation={3} sx={{ padding: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Log in
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <TextField
                            label="Tenant ID"
                            type="number"
                            value={tenantId}
                            onChange={(e) => setTenantId(e.target.value)}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            fullWidth
                        />

                        {error && <Alert severity="error">{error}</Alert>}

                        <Button type="submit" variant="contained" size="large" fullWidth>
                            Log in
                        </Button>
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
}

export default LoginPage;