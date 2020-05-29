import React from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Alert from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Header from "../components/Header";
import ConvertCard from "../components/ConvertCard";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
  },
  content: {
    minHeight: "100vh",
    marginTop: theme.spacing(16),
  },
}));

export default function MainPage() {
  const classes = useStyles();

  return (
    <Grid container className={classes.root}>
      <CssBaseline />
      <Header />
      <Grid
        container
        spacing={4}
        alignItems="center"
        className={classes.content}
        direction="column"
      >
        <Grid item>
          <Alert severity="warning">
            This is a test project not meant for real use. It operates on
            Bitcoin testnet and Ethereum Kovan testnet
          </Alert>
        </Grid>
        <Container component="main" maxWidth="xs">
          <ConvertCard />
        </Container>
      </Grid>
    </Grid>
  );
}
