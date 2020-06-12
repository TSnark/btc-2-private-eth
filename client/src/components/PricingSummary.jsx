import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useIntl } from "react-intl";

const useStyles = makeStyles(() => ({
  cellRoot: {
    borderBottom: "none",
  },
}));

export default function PricingSummary({ price, priceImpact }) {
  const classes = useStyles();
  const intl = useIntl();

  let rows = useMemo(
    () => [
      {
        label: "Price",
        value: `${intl.formatNumber(price, {
          minimumFractionDigits: 10,
          maximumFractionDigits: 10,
        })} BTC per ETH `,
      },
      {
        color: priceImpact > 0.05 ? "error" : "inherit",
        label: "Price Impact",
        value: intl.formatNumber(priceImpact, {
          style: "percent",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      },
      { label: "RenVM Fees", value: "0.1% + 0.00035 BTC" },
      { label: "Uniswap Fees", value: "0.3%" },
    ],
    [price, priceImpact, intl]
  );

  return (
    <Table className={classes.root} size="small">
      <TableBody>
        {rows.map((row) => (
          <>
            <TableRow key={row.label}>
              <TableCell classes={{ root: classes.cellRoot }} padding="none">
                <Typography color={row.color} variant="caption">
                  {row.label}
                </Typography>
              </TableCell>
              <TableCell
                align="right"
                classes={{ root: classes.cellRoot }}
                padding="none"
              >
                <Typography color={row.color} variant="caption">
                  {row.value}
                </Typography>
              </TableCell>
            </TableRow>
          </>
        ))}
      </TableBody>
    </Table>
  );
}
