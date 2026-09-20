import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1565c0",
    },
    secondary: {
      main: "#00a896",
    },
  },
  typography: {
    fontFamily: "system-ui, sans-serif",
  },
});

export default theme;