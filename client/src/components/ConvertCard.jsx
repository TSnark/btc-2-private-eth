import React, { useState, useContext } from "react";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import Grid from "@material-ui/core/Grid";
import { FormGroup, FormControlLabel } from "@material-ui/core";
import { Card, CardContent } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { makeStyles } from "@material-ui/core/styles";
import EthSlider from "./EthSlider";
import PricingSummary from "./PricingSummary";
import TornadoCashNote from "./TornadoCashNote";
import Web3Context from "../state/Web3Context";
import usePrepareDeposit from "../hooks/usePrepareDeposit";
import GridLoader from "react-spinners/GridLoader";

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
  pricingSummary: {
    margin: theme.spacing(3, 0, 0),
  },
  checkbox: {
    margin: theme.spacing(2, 0, 0),
  },
  submit: {
    borderRadius: 24,
    margin: theme.spacing(2, 0, 2),
  },
  spinner: {
    display: "flex",
    justifyContent: "center",
    margin: theme.spacing(24, 0, 0),
  },
}));

export default function ConvertCard({ deposit }) {
  const [ethToRetrieve, setEthToRetrieve] = useState(1e17);
  const [awaitingTransaction, setAwaitingTransaction] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const classes = useStyles();
  const { web3 } = useContext(Web3Context);

  // Call debounced function asynchronously...
  const preparedDeposit = usePrepareDeposit(web3, ethToRetrieve);
  const handleCheckBoxEvent = (event) => {
    setAgreed(event.target.checked);
  };

  const onDeposit = async () => {
    setAwaitingTransaction(true);
    try {
      await deposit(
        preparedDeposit.result.btcToTransfer,
        preparedDeposit.result.commitment,
        ethToRetrieve,
        preparedDeposit.result.note
      );
      setAwaitingTransaction(false);
    } catch (error) {
      setAwaitingTransaction(false);
      console.log(error);
    }
  };

  const NoteOrWarning = () => {
    return preparedDeposit.result && !preparedDeposit.result.enoughLiquidity ? (
      <Grid item xs={12}>
        <Alert severity="error">
          Insufficient ETH in Uniswap:{" "}
          {preparedDeposit.result &&
            (preparedDeposit.result.ethReserveInWei / 1e18).toFixed(8)}{" "}
          ETH
        </Alert>
      </Grid>
    ) : (
      <>
        <Grid item xs={12}>
          {preparedDeposit.result.approximateSlippage}
          <TornadoCashNote
            id="tornado-note"
            title="Tornado Cash Note"
            content={preparedDeposit.result.note}
          />
        </Grid>
        <Grid item xs={12} className={classes.pricingSummary}>
          <PricingSummary
            price={preparedDeposit.result.price}
            priceImpact={preparedDeposit.result.priceImpact}
          />
        </Grid>
        <Grid item xs={12}>
          <FormGroup row className={classes.checkbox}>
            <FormControlLabel
              control={
                <Checkbox
                  disabled={!!awaitingTransaction}
                  checked={agreed}
                  onChange={handleCheckBoxEvent}
                  name="agreeCB"
                  color="primary"
                />
              }
              label="I have safely stored this note"
            />
          </FormGroup>
        </Grid>

        <Grid item xs={12}>
          <Button
            disabled={!!awaitingTransaction || !agreed}
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={onDeposit}
          >
            Convert BTC to Private ETH
          </Button>
        </Grid>
      </>
    );
  };

  if (!preparedDeposit.result) {
    return (
      <div className={classes.spinner}>
        <GridLoader size={16} color={"#123abc"} loading={true} />
      </div>
    );
  } else {
    return (
      <Card className={classes.card} variant="outlined">
        <CardContent className={classes.cardContent}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <EthSlider
                disabled={!!awaitingTransaction}
                onChange={(value) => {
                  if (value !== ethToRetrieve) {
                    setEthToRetrieve(value);
                    setAgreed(false);
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <NoteOrWarning />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }
}
