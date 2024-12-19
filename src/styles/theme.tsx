import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#ff007f",
    },
    secondary: {
      main: "#00e676", 
    },
    background: {
      default: "#e3f2fd",
      paper: "rgba(255, 255, 255, 0.10)",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#FFFFFF",
    },
  },
  shape: {
    borderRadius: 20,
  },
});

export default theme;
