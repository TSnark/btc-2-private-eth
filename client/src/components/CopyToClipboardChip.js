import React from "react";
import Chip from "@material-ui/core/Chip";
import { CopyToClipboard } from "react-copy-to-clipboard";
import DoneIcon from "@material-ui/icons/Done";

export default function Chips({ label, color, icon }) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CopyToClipboard text={label}>
        <Chip
          icon={icon}
          label={label}
          clickable
          color={color}
          deleteIcon={<DoneIcon />}
        />
      </CopyToClipboard>
    </div>
  );
}
