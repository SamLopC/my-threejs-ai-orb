import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#3f51b5", // Deep Blue
    },
    secondary: {
      main: "#00e676", // Bright Green
    },
    background: {
      default: "#e3f2fd",
      paper: "#ffffff",
    },
    text: {
      primary: "#333333",
      secondary: "#555555",
    },
  },
  shape: {
    borderRadius: 20,
  },
});

export default theme;
