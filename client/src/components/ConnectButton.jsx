import React from "react";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  submit: {
    borderRadius: 24,
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function ConnectButton({ onConnect }) {
  const classes = useStyles();

  return (
    <Button
      type="submit"
      fullWidth
      variant="contained"
      color="primary"
      className={classes.submit}
      onClick={onConnect}
      size="large"
    >
      Connect your Ethereum wallet
    </Button>
  );
}
