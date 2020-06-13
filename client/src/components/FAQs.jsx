import React from "react";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import { withStyles } from "@material-ui/core/styles";
import MuiExpansionPanel from "@material-ui/core/ExpansionPanel";
import MuiExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import MuiExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

const ExpansionPanel = withStyles({
  root: {
    padding: 0,
    boxShadow: "none",
    "&:not(:last-child)": {
      borderBottom: 0,
    },
    "&:before": {
      display: "none",
    },
    "&$expanded": {
      margin: "auto",
    },
  },
  expanded: {},
})(MuiExpansionPanel);

const ExpansionPanelSummary = withStyles({
  root: {
    padding: 0,
    marginBottom: -1,
    minHeight: 56,
    "&$expanded": {
      minHeight: 56,
    },
  },
  content: {
    "&$expanded": {
      margin: "12px 0",
    },
  },
  expanded: {},
})(MuiExpansionPanelSummary);

const ExpansionPanelDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(0),
  },
}))(MuiExpansionPanelDetails);

function FAQ({ title, children, expanded }) {
  return (
    <ExpansionPanel elevation={0} defaultExpanded={!!expanded}>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <ExpansionPanelDetails>
          <Typography variant="h6">{title}</Typography>
        </ExpansionPanelDetails>
      </ExpansionPanelSummary>
      {children}
    </ExpansionPanel>
  );
}

function TextFAQ({ title, text, expanded }) {
  return (
    <FAQ title={title} expanded={expanded}>
      <Typography variant="body1" gutterBottom>
        {text}
      </Typography>
    </FAQ>
  );
}

const Intro = () => {
  return (
    <Typography variant="subtitle1">
      This project allows you to acquire privacy preserving Ether with your
      Bitcoins. It uses{" "}
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
  );
};

const DepositSteps = () => {
  return (
    <List>
      <ListItem>
        <Typography>1) Select the required ETH amount.</Typography>
      </ListItem>
      <ListItem>
        <Typography>2) Press the start button.</Typography>
      </ListItem>
      <ListItem>
        <Typography>
          3) Send the required BTC amount to the RenVM address displayed.
        </Typography>
      </ListItem>
      <ListItem>
        <Typography>
          4) Wait for bitcoin confirmations, this takes 2 blocks. You will be
          notified by the dApp when all confirmations are verified.
        </Typography>
      </ListItem>
      <ListItem>
        <Typography>
          5) When prompted sign the transaction in your Ethereum wallet.
        </Typography>
      </ListItem>
      <ListItem>
        <Typography>
          6) Backup the Tornado Cash note for future withdrawal.
        </Typography>
      </ListItem>
    </List>
  );
};

const HowToWithdraw = () => {
  return (
    <>
      <Typography variant="body1">
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
      <Typography variant="body1">
        <strong>
          Never withdraw immediately after a deposit. Before withdrawing read
          the guide provided on the Tornado Cash website
        </strong>
      </Typography>
    </>
  );
};

const entries = [
  <FAQ title="Intro" expanded={true}>
    <Intro />
  </FAQ>,
  <TextFAQ
    title="What is renBTC"
    text="renBTC is a representation of BTC on the Ethereum
          blockchain. It is an ERC20, and backed 1:1 by BTC 
          locked in RenVM, a decentralized custodian.
          renBTC is redeemable at any time for real BTC."
  />,
  <FAQ title="How to deposit">
    <DepositSteps />
  </FAQ>,
  <TextFAQ
    title="Lot sizes and price movement"
    text="Tornado cash accepts only specific deposit amounts, this app
            calculates the BTC amount to be converted and adds a 1% buffer to
            absorb price movements in the renBTC/ETH trading pair which can
            happen while confirmations are verified. The remainder of the
            conversion will be sent to your Ethereum address shown in the
            toolbar. In case the price moves too much and the desired lot size
            cannot be acquired in Uniswap, the whole renBTC amount will be
            forwarded to the address shown in the toolbar."
  />,
  <TextFAQ
    title="Transaction recovery"
    text="In case the tab containing this app is closed whilst a transaction
            is not fully finalized, re-opening the app will prompt the user to
            finalize the pending transaction. For this reason is very important
            to copy and store the withdrawal note before starting any
            transaction as the app can only recover the previous transaction but
            not the previous note."
  />,
  <FAQ title="How to withdraw">
    <HowToWithdraw />
  </FAQ>,
  <FAQ title="Technical explanation">
    <Typography variant="body1">
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
  </FAQ>,
];

export default function FAQs() {
  return <>{entries.map((entry) => entry)}</>;
}
