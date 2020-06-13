import React, { useState } from "react";
import copyToClipboard from "../utils/ClipboardUtils";

import { OutlinedInput, Snackbar, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import HTMLTooltip from "./HTMLTooltip";

const textFieldStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 24,
  },
  disabled: {
    color: theme.palette.text.primary,
  },
}));

export default function TornadoCashNote({ id, title, content }) {
  const textFieldClasses = textFieldStyles();
  const [open, setOpen] = useState(false);

  const copyContent = () => {
    copyToClipboard(id);
    setOpen(true);
  };

  return (
    <>
      <HTMLTooltip
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
      </HTMLTooltip>
      <Snackbar
        open={open}
        autoHideDuration={2000}
        message="Copied to clipboard"
        onClose={() => setOpen(false)}
      />
    </>
  );
}
