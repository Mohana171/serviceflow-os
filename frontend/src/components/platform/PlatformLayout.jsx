import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useNavigate } from "react-router-dom";
import { getPlatformUser, platformLogout } from "../../services/platformAuthService";

const platformTheme = createTheme({
    palette: {
        mode: "dark",
        primary: { main: "#9575ff" },
        background: { default: "#0e1021", paper: "#181c33" },
    },
    shape: { borderRadius: 10 },
    typography: { fontFamily: "system-ui, sans-serif" },
});

function PlatformLayout({ children, showLogout = false }) {
    const navigate = useNavigate();

    function handleLogout() {
        platformLogout();
        navigate("/platform/login");
    }

    return (
        <ThemeProvider theme={platformTheme}>
            <CssBaseline />
            <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
                <AppBar position="static" elevation={0}
                        sx={{ bgcolor: "#141830", borderBottom: "1px solid #2a2f52" }}>
                    <Toolbar>
                        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                            ServiceFlow
                        </Typography>
                        <Chip label="PLATFORM CONSOLE" size="small" color="primary"
                              sx={{ marginLeft: 2, fontWeight: 700 }} />
                        <Box sx={{ flexGrow: 1 }} />
                        {showLogout && (
                            <>
                                <Typography variant="body2" sx={{ marginRight: 2, opacity: 0.7 }}>
                                    {getPlatformUser()}
                                </Typography>
                                <Button color="inherit" onClick={handleLogout}>Log out</Button>
                            </>
                        )}
                    </Toolbar>
                </AppBar>
                {children}
            </Box>
        </ThemeProvider>
    );
}

export default PlatformLayout;