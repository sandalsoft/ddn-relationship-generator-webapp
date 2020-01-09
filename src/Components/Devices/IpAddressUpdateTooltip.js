import React from "react";
import ReactTooltip from "react-tooltip";

const ipAddressUpdateTooltip = props => {
  // const {lastIpUpdate} = props

  // const tooltipText = `IP last updated ${props}`;
  return (
    <div>
      <ReactTooltip place="top" type="dark" effect="float" />
    </div>
  );
};

export default ipAddressUpdateTooltip;
