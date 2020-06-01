import React, { useState } from "react";
import copyToClipboard from "../utils/ClipboardUtils";

import {
  OutlinedInput,
  Tooltip,
  Snackbar,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const textFieldStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 24,
  },
  disabled: {
    color: theme.palette.text.primary,
  },
}));

const tooltipStyles = makeStyles((theme) => ({
  tooltip: {
    borderRadius: 12,
    backgroundColor: "#f5f5f9",
    color: "rgba(0, 0, 0, 0.87)",
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: "1px solid #dadde9",
    padding: theme.spacing(1, 2, 1, 2),
  },
}));

export default function TornadoCashNote({ id, title, content }) {
  const textFieldClasses = textFieldStyles();
  const tooltipClasses = tooltipStyles();
  const [open, setOpen] = useState(false);

  const copyContent = () => {
    copyToClipboard(id);
    setOpen(true);
  };

  return (
    <>
      <Tooltip
        classes={tooltipClasses}
        placement="right-start"
        title={
          <>
            <Typography color="inherit">Click to copy</Typography>
            {
              "You will use this note to retrieve your private ETH from Tornado Cash."
            }
            <Typography color="inherit">
              <u>
                <b>{"Keep it private and safe."}</b>
              </u>
            </Typography>
          </>
        }
        aria-label="copy"
      >
        <OutlinedInput
          classes={textFieldClasses}
          disabled
          onClick={() => copyContent()}
          id={id}
          label={title}
          variant="outlined"
          value={content}
          multiline
          fullWidth
        />
      </Tooltip>
      <Snackbar
        open={open}
        autoHideDuration={2000}
        message="Copied to clipboard"
        onClose={() => setOpen(false)}
      />
    </>
  );
}
