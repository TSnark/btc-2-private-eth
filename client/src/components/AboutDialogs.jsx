import React from "react";
import { withStyles, useTheme } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import useMediaQuery from "@material-ui/core/useMediaQuery";

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(3),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2, 4, 2),
  },
}))(MuiDialogContent);

export default function AboutDialog() {
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button color="secondary" onClick={handleClickOpen}>
        How it works
      </Button>
      <Dialog onClose={handleClose} open={open} fullScreen={fullScreen}>
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          BTC to Private ETH
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1" gutterBottom>
            This project allows you to acquire privacy preserving Ether with
            your Bitcoins. It uses{" "}
            <Link
              href="https://renproject.io/"
              target="_blank"
              color="inherit"
              underline="always"
            >
              RenVM
            </Link>
            {", "}
            <Link
              href="https://uniswap.org/"
              target="_blank"
              color="inherit"
              underline="always"
            >
              Uniswap
            </Link>
            {" and "}
            <Link
              href="https://tornado.cash/"
              target="_blank"
              color="inherit"
              underline="always"
            >
              Tornado Cash
            </Link>
            .
          </Typography>
          <Typography variant="h6" gutterBottom>
            How to deposit
          </Typography>
          <List>
            <ListItem>
              <Typography gutterBottom>
                1) Select the required ETH amount.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography gutterBottom>2) Press the start button.</Typography>
            </ListItem>
            <ListItem>
              <Typography gutterBottom>
                3) Send the required BTC amount to the RenVM address displayed.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography gutterBottom>
                4) Wait for bitcoin confirmations, this takes 2 blocks. You will
                be notified by the dApp when all confirmations are verified.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography gutterBottom>
                5) When prompted sign the transaction in your Ethereum wallet.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography gutterBottom>
                6) Backup the Tornado Cash note for future withdrawal.
              </Typography>
            </ListItem>
          </List>
          <Typography variant="h6" gutterBottom>
            Lot sizes and price movement
          </Typography>
          <Typography variant="body1" gutterBottom>
            Tornado cash accepts only specific deposit amounts, this app
            calculates the BTC amount to be converted and adds a 1% buffer to
            absorb price movements in the renBTC/ETH trading pair which can
            happen while confirmations are verified. The remainder of the
            conversion will be sent to your Ethereum address shown in the
            toolbar. In case the price moves too much and the desired lot size
            cannot be acquired in Uniswap, the whole renBTC amount will be
            forwarded to the address shown in the toolbar.
          </Typography>
          <Typography variant="h6" gutterBottom>
            Transaction recovery
          </Typography>
          <Typography variant="body1" gutterBottom>
            In case the tab containing this app is closed whilst a transaction
            is not fully finalized, re-opening the app will prompt the user to
            finalize the pending transaction. For this reason is very important
            to copy and store the withdrawal note before starting any
            transaction as the app can only recover the previous transaction but
            not the previous note.
          </Typography>
          <Typography variant="h6" gutterBottom>
            How to withdraw
          </Typography>
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
            and present the secret note provided by this dApp.
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>
              Never withdraw immediately after a deposit. Before withdrawing
              read the guide provided on the Tornado Cash website
            </strong>
          </Typography>
          <Typography gutterBottom variant="h6">
            Technical explanation.
          </Typography>
          <Typography variant="body1" gutterBottom>
            For explanation and source code go to the{" "}
            <Link
              href="https://github.com/TSnark/btc-2-private-eth"
              color="inherit"
              target="_blank"
              underline="always"
            >
              project page
            </Link>{" "}
            and present the secret note provided by this dApp.
          </Typography>
        </DialogContent>
      </Dialog>
    </div>
  );
}
