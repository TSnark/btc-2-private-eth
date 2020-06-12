import React, { useState } from "react";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Header from "../components/Header";
import ConvertScreen from "../components/ConvertScreen";
import ConnectScreen from "../components/ConnectScreen";
import Web3Context from "../state/Web3Context";

const useStyles = makeStyles((theme) => ({
  content: {
    [theme.breakpoints.up("sm")]: {
      marginTop: theme.spacing(16),
    },
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(0, 2, 0),
      marginTop: theme.spacing(3),
    },
  },
}));

export default function MainPage() {
  const classes = useStyles();
  const [web3State, setWeb3State] = useState({ connected: false });

  return (
    <Web3Context.Provider value={web3State}>
      <Grid container className={classes.root}>
        <Header />
        <Grid
          container
          spacing={4}
          alignItems="center"
          className={classes.content}
          direction="column"
        >
          {!web3State.connected ? (
            <Container component="main" maxWidth="xs">
              <ConnectScreen
                onConnect={setWeb3State}
                onDisconnect={() => setWeb3State({ connected: false })}
              />
            </Container>
          ) : (
            <Container component="main" maxWidth="sm" fixed>
              <ConvertScreen />
            </Container>
          )}
        </Grid>
      </Grid>
    </Web3Context.Provider>
  );
}
