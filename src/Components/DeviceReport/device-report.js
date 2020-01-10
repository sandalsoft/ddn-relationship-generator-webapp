import * as R from "ramda";
import React from "react";

const DeviceReport = props => {
  const devices = R.pathOr(
    [{ macAddress: `no devices yet` }],
    [`history`, `location`, `state`, `devices`],
    props
  );

  return (
    <div className="pov-report">
      <ul>customer Name: {props.customerName}</ul>
      <ul>totalDevices: {devices.length}</ul>
    </div>
  );
};
export default DeviceReport;
