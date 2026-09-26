import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import PlatformLayout from "../../components/platform/PlatformLayout";
import { platformLogin } from "../../services/platformAuthService";

function PlatformLoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        try {
            await platformLogin(username, password);
            navigate("/platform");
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <PlatformLayout>
            <Box sx={{ maxWidth: 380, margin: "80px auto", padding: 2 }}>
                <Paper elevation={6} sx={{ padding: 4 }}>
                    <Typography variant="h5" gutterBottom>Platform sign in</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7, marginBottom: 2 }}>
                        Restricted to the platform owner.
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                            <TextField label="Username" value={username}
                                       onChange={(e) => setUsername(e.target.value)}
                                       required fullWidth />
                            <TextField label="Password" type="password" value={password}
                                       onChange={(e) => setPassword(e.target.value)}
                                       required fullWidth />
                            {error && <Alert severity="error">{error}</Alert>}
                            <Button type="submit" variant="contained" size="large">Sign in</Button>
                        </Stack>
                    </Box>
                </Paper>
            </Box>
        </PlatformLayout>
    );
}

export default PlatformLoginPage;