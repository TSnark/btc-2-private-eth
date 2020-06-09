import React, { useState, useContext } from "react";
import { deposit as tornado } from "../utils/TornadoUtils";
import estimateAmountToSwap from "../utils/PricingUtils";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import Grid from "@material-ui/core/Grid";
import { FormGroup, FormControlLabel } from "@material-ui/core";
import { Card, CardContent } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { makeStyles } from "@material-ui/core/styles";
import EthSlider from "./EthSlider";
import TornadoCashNote from "./TornadoCashNote";
import { useAsync } from "react-async-hook";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import useConstant from "use-constant";
import Web3Context from "../state/Web3Context";

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
  checkbox: {
    margin: theme.spacing(2, 0, 0),
  },
  submit: {
    borderRadius: 24,
    margin: theme.spacing(2, 0, 2),
  },
}));

const prepareDeposit = async (web3, ethToRetrieve) => {
  let { btcToTransferInSats, ethReserveInWei } = await estimateAmountToSwap(
    web3,
    ethToRetrieve
  );
  const enoughLiquidity = ethReserveInWei > ethToRetrieve;
  let { note, commitment } = await tornado(web3, ethToRetrieve);
  return {
    enoughLiquidity,
    btcToTransferInSats,
    ethReserveInWei,
    note,
    commitment,
  };
};

export default function ConvertCard({ deposit }) {
  const [ethToRetrieve, setEthToRetrieve] = useState(1e17);
  const [converting, setConverting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const classes = useStyles();
  const { web3 } = useContext(Web3Context);

  // We debounce to avoid race conditions on state changes
  const debouncedPrepareDeposit = useConstant(() =>
    AwesomeDebouncePromise((web3, ethToRetrieve) => {
      setAgreed(false);
      return prepareDeposit(web3, ethToRetrieve);
    }, 300)
  );

  // Call debounced function asynchronously...
  const preparedDeposit = useAsync(
    debouncedPrepareDeposit,
    [web3, ethToRetrieve],
    {
      // ...refresh state only after call returns
      setLoading: (state) => ({ ...state, loading: true }),
    }
  );

  const handleCheckBoxEvent = (event) => {
    setAgreed(event.target.checked);
  };

  const onDeposit = async () => {
    setConverting(true);
    try {
      await deposit(
        preparedDeposit.result.btcToTransferInSats,
        preparedDeposit.result.commitment,
        ethToRetrieve
      );
      setConverting(false);
    } catch (error) {
      setConverting(false);
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
          <TornadoCashNote
            id="tornado-note"
            title="Tornado Cash Note"
            content={preparedDeposit.result.note}
          />
        </Grid>
        <Grid item xs={12}>
          <FormGroup row className={classes.checkbox}>
            <FormControlLabel
              control={
                <Checkbox
                  disabled={!!converting}
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
            disabled={!!converting || !agreed}
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

  return (
    <>
      {preparedDeposit.result && (
        <Card className={classes.card} variant="outlined">
          <CardContent className={classes.cardContent}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <EthSlider
                  disabled={!!converting}
                  onChange={setEthToRetrieve}
                />
              </Grid>
              <Grid item xs={12}>
                <NoteOrWarning />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </>
  );
}
