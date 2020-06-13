import React from "react";
import { Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

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

export default function HTMLTooltip({ title, children }) {
  const tooltipClasses = tooltipStyles();

  return (
    <Tooltip classes={tooltipClasses} placement="right-start" title={title}>
      {children}
    </Tooltip>
  );
}
