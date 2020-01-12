import * as R from "ramda";
import React from "react";
import { Card } from "antd";

const DeviceReport = props => {
  const devices = R.pathOr(
    [{ macAddress: `no devices yet` }],
    [`history`, `location`, `state`, `devices`],
    props
  );

  return (
    <div style={{ background: "#fff", padding: "30px" }}>
      <Card
        title="POV Report Output"
        style={{
          background: "#fff",
          height: "100%",
          width: "75%",
          boxShadow: "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)"
        }}
      >
        <ul>customer Name: {props.customerName}</ul>
        <ul>totalDevices: {devices.length}</ul>
        <p>Card content</p>
      </Card>
    </div>
  );
};
export default DeviceReport;
