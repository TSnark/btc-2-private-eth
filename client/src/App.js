import React, { Component } from "react";
import MainPage from "./pages/MainPage";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";

import "./App.css";

const darkTheme = createMuiTheme({
  palette: {
    type: "dark",
    background: { default: "#160e1f", paper: "#19172b" },
    primary: {
      main: "#183a56",
    },
    secondary: {
      main: "#464159",
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
