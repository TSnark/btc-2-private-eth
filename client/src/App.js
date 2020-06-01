import React, { Component } from "react";
import MainPage from "./pages/MainPage";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";

import "./App.css";

const darkTheme = createMuiTheme({
  palette: {
    type: "dark",
    background: { default: "#020024", paper: "rgba(0, 212, 255, 0.08)" },
    primary: {
      main: "#00d4ff",
    },
    secondary: {
      main: "#586e9a",
    },
  },
});

class App extends Component {
  render() {
    return (
      <ThemeProvider theme={darkTheme}>
        <MainPage />
      </ThemeProvider>
    );
  }
}

export default App;
