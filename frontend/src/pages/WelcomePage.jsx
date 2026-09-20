import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { getCurrentUser } from "../services/authService";

function WelcomePage() {
  const user = getCurrentUser();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        minHeight: "70vh",
        padding: 4,
      }}
    >
      <Typography variant="h3" gutterBottom>
        Welcome to ServiceFlow OS
      </Typography>

      <Typography variant="h6" color="text.secondary" gutterBottom>
        {user ? `Signed in as ${user.fullName} (${user.role})` : ""}
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480, marginTop: 1 }}>
        Manage your team, customers, and jobs all in one place.
      </Typography>
    </Box>
  );
}

export default WelcomePage;