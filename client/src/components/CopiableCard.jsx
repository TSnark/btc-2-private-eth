import React, { useState } from "react";
import copyToClipboard from "../utils/ClipboardUtils";
import FileCopySharpIcon from "@material-ui/icons/FileCopySharp";

import {
  Card,
  CardContent,
  IconButton,
  Typography,
  Snackbar,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  content: {
    wordBreak: "break-all",
    marginTop: theme.spacing(2),
  },
  title: {
    fontSize: 14,
  },
}));

export default function CopiableCard({ id, title, content }) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const copyContent = () => {
    copyToClipboard(id);
    setOpen(true);
  };

  return (
    <Card>
      <CardContent>
        <Typography
          className={classes.title}
          color="textSecondary"
          gutterBottom
        >
          {title}
        </Typography>
        <Typography id={id} className={classes.content}>
          {content}
        </Typography>
      </CardContent>
      {/* <CardActions> */}
      <IconButton onClick={() => copyContent()}>
        <FileCopySharpIcon />
      </IconButton>
      {/* </CardActions> */}
      <Snackbar
        open={open}
        autoHideDuration={2000}
        message="Copied to clipboard"
        onClose={() => setOpen(false)}
      ></Snackbar>
    </Card>
  );
}
