import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    borderRadius: 24,
    position: "absolute",
    width: theme.spacing(50),
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2, 4, 3),
    outline: 0,
  },
}));

export default function WrongNetworkPopup({ open, setOpen }) {
  const classes = useStyles();
  const [modalStyle] = React.useState(getModalStyle);
  const handleClose = () => {
    setOpen(false);
  };
  const body = (
    <div style={modalStyle} className={classes.paper}>
      <h2>Switch network</h2>
      <p>Please connect wallet to the Kovan testnet</p>
      <WrongNetworkPopup />
    </div>
  );

  return (
    <div>
      <Modal open={open} onClose={handleClose} disableAutoFocus={true}>
        {body}
      </Modal>
    </div>
  );
}
