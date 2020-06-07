import React, { Component } from "react";
import MainPage from "./pages/MainPage";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import "./App.css";

const darkTheme = createMuiTheme({
  palette: {
    type: "dark",
    background: {
      default: "#0E233D",
      paper: "#1A365C",
    },
    primary: {
      main: "#0084FD",
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
        <CssBaseline />
        <MainPage />
      </ThemeProvider>
    );
  }
}

export default App;
