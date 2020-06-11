import React from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { Card, CardContent, Typography, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import TornadoCashNote from "./TornadoCashNote";

const useStyles = makeStyles((theme) => ({
  card: {
    borderRadius: 24,
    textAlign: "center",
  },
  cardTitle: {
    fontSize: 14,
    textAlign: "center",
    spacing: 10,
  },
  cardContent: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(2),
    paddingRight: theme.spacing(6),
    paddingLeft: theme.spacing(6),
  },
  link: {
    margin: theme.spacing(2, 0, 0),
  },
  submit: {
    borderRadius: 24,
    margin: theme.spacing(2, 0, 2),
  },
}));

export default function DoneCard({ onStart, note }) {
  const classes = useStyles();

  return (
    <Card className={classes.card} variant="outlined">
      <CardContent className={classes.cardContent}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography gutterBottom variant="h6">
              Deposit completed
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid item xs={12}>
              <TornadoCashNote
                id="tornado-note"
                title="Tornado Cash Note"
                content={note}
              />
            </Grid>
            <Grid item xs={12} className={classes.link}>
              <Typography variant="body1" gutterBottom>
                To withdraw your private ETH, go to{" "}
                <Link
                  href="https://tornado.cash/"
                  target="_blank"
                  color="inherit"
                  underline="always"
                >
                  Tornado Cash
                </Link>{" "}
                in at least 24 hours
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={onStart}
              >
                Start new deposit
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
