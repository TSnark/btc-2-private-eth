import React, { useState } from "react";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Header from "../components/Header";
import ConvertCard from "../components/ConvertCard";
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
  const [web3, setWeb3] = useState();

  return (
    <Web3Context.Provider value={web3}>
      <Grid container className={classes.root}>
        <Header />
        <Grid
          container
          spacing={4}
          alignItems="center"
          className={classes.content}
          direction="column"
        >
          <Container component="main" maxWidth="xs">
            {!web3 ? (
              <ConnectScreen
                onConnect={setWeb3}
                onDisconnect={() => setWeb3(null)}
              />
            ) : (
              <ConvertCard />
            )}
          </Container>
        </Grid>
      </Grid>
    </Web3Context.Provider>
  );
}
