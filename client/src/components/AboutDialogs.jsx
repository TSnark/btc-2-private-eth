import React from "react";
import { withStyles } from "@material-ui/core/styles";
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
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

export default function AboutDialogs() {
  const [open, setOpen] = React.useState(false);

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
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          <Typography variant="h3" gutterBottom>
            How does this work
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="h5" gutterBottom>
            Deposits
          </Typography>
          <Typography variant="body1" gutterBottom>
            This DApp converts your BTC into private ETH.
          </Typography>
          <Typography variant="body1" gutterBottom>
            After your BTC transfer is confirmed (2 blocks), you can withdraw
            your ETH to a wallet of your choice without having any on chain link
            between the BTC you sent and the ETH you received.
          </Typography>
          <Typography variant="h5" gutterBottom>
            Withdrawals
          </Typography>
          <Typography variant="body1" gutterBottom>
            To withdraw your private ETH, go to{" "}
            <Link href="https://tornado.cash/" color="white">
              Tornado Cash
            </Link>{" "}
            and present the secret note from this Dapp.
          </Typography>
          <Typography gutterBottom variant="h5">
            Technical explanation.
          </Typography>
          <Typography gutterBottom>
            This DApp performs the following steps:
          </Typography>
          <List>
            <ListItem>
              <Typography gutterBottom>
                1) Queries the latest price of the pair zBTC/ETH on{" "}
                <Link href="https://uniswap.org/" color="white">
                  Uniswap
                </Link>
              </Typography>
            </ListItem>
            <ListItem>
              <Typography gutterBottom>
                2) Sets up a{" "}
                <Link href="https://renproject.io/" color="white">
                  REN VM{" "}
                </Link>
                mint and transfer to convert BTC into zBTC Once the transfer is
                confirmed
              </Typography>
            </ListItem>
            <ListItem>
              <Typography gutterBottom>
                3) Mints new zBTC using the REN VM signature
              </Typography>
            </ListItem>
            <ListItem>
              <Typography gutterBottom>4) Converts zBTC into ETH</Typography>
            </ListItem>
            <ListItem>
              <Typography gutterBottom>
                5) Deposits ETH into{" "}
                <Link href="https://tornado.cash/" color="white">
                  Tornado Cash
                </Link>
              </Typography>
            </ListItem>
            <ListItem>
              <Typography gutterBottom>
                6) Forwards the remainder ETH to the originating user Address
              </Typography>
            </ListItem>
          </List>
        </DialogContent>
      </Dialog>
    </div>
  );
}
