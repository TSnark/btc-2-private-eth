import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Grid from "@material-ui/core/Grid";
import logo from "./logo.svg";
import AboutDialog from "./AboutDialogs";

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  logo: {
    padding: 12,
    width: 64,
    height: 64,
  },
});

export default function Header() {
  const classes = useStyles();

  return (
    <Toolbar className={classes.root}>
      <img className={classes.logo} src={logo} alt="pRamp logo" />
      <Grid container justify="flex-end">
        <AboutDialog />
      </Grid>
    </Toolbar>
  );
}
