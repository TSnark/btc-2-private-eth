import React from "react";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/core/Slider";

const marks = [
  {
    value: 0,
    valueInGwei: 1e17,
    label: "0.1 ETH",
  },
  {
    value: 50,
    valueInGwei: 1e18,
    label: "1 ETH",
  },
  {
    value: 100,
    valueInGwei: 1e19,
    label: "10 ETH",
  },
];

function valuetext(value) {
  return `${value} ETH`;
}

function valueLabelFormat(value) {
  return marks.find((mark) => mark.value === value).label.replace(" ETH", "");
}

function gweiValue(value) {
  return marks.find((mark) => mark.value === value).valueInGwei;
}

export default function EthSlider({ onChange, disabled }) {
  return (
    <div>
      <Typography id="eth-slider" variant="h6" gutterBottom>
        Amount to retrieve
      </Typography>
      <Slider
        disabled={disabled}
        defaultValue={0}
        valueLabelFormat={valueLabelFormat}
        getAriaValueText={valuetext}
        aria-labelledby="eth-slider"
        step={null}
        valueLabelDisplay="auto"
        marks={marks}
        onChange={(_, value) => onChange(gweiValue(value))}
      />
    </div>
  );
}
