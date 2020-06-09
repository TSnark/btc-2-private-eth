import React, { useContext } from "react";
import Chip from "@material-ui/core/Chip";
import Web3Context from "../state/Web3Context";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";

function ellipsisMiddle(str) {
  return str.substr(0, 6) + "..." + str.substr(str.length - 3, str.length);
}

export default function AccountChip() {
  const context = useContext(Web3Context);
  return (
    <>
      {!!context && !!context.accounts && (
        <Chip
          icon={<CheckCircleOutlineIcon />}
          label={ellipsisMiddle(context.accounts[0])}
          variant="outlined"
        />
      )}
    </>
  );
}
