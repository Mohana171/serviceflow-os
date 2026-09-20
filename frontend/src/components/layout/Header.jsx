import { Link, useLocation, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { logout, isLoggedIn, getCurrentUser } from "../../services/authService";

const NAV_LINKS = [
    { label: "Users", path: "/users" },
    { label: "Customers", path: "/customers" },
    { label: "Skills", path: "/skills" },
    { label: "Territories", path: "/territories" },
    { label: "Jobs", path: "/jobs" },
];

function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const loggedIn = isLoggedIn();
    const user = getCurrentUser();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    const currentTab = NAV_LINKS.some((link) => link.path === location.pathname)
        ? location.pathname
        : false;

    return (
        <AppBar position="static">
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6" component="div">
                    ServiceFlow
                </Typography>

                {loggedIn && (
                    <>
                        <Tabs
                            value={currentTab}
                            textColor="inherit"
                            indicatorColor="secondary"
                            sx={{ flexGrow: 1, marginLeft: 4 }}
                        >
                            {NAV_LINKS.map((link) => (
                                <Tab
                                    key={link.path}
                                    label={link.label}
                                    value={link.path}
                                    component={Link}
                                    to={link.path}
                                />
                            ))}
                        </Tabs>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Typography variant="body1">{user?.fullName}</Typography>
                            <Button color="inherit" variant="outlined" onClick={handleLogout}>
                                Log out
                            </Button>
                        </Box>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default Header;