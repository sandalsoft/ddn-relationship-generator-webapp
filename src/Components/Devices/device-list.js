import * as R from "ramda";
import { Route, Link } from "react-router-dom";
import React from "react";
import Device from "./Device";

const DeviceList = props => {
  const devices = R.pathOr(
    [{ macAddress: `no devices yet` }],
    [`history`, `location`, `state`, `devices`],
    props
  );
  // const { devices } = props.history.location.state;

  // console.log(`devices: ${JSON.stringify(devices)}`);
  return (
    <div>
      Device List
      <br />
      {devices.map(device => (
        <li key={device.macAddress}>
          <Link
            to={{
              pathname: `/devices/${device.macAddress}`,
              state: {
                device
              }
            }}
          >
            {" "}
            {device.macAddress}
          </Link>
          - {device.macAddress} - {device.osType} - {device.osFamily} -{" "}
          {device.classificationScore} - {device.dhcpHostname} -{" "}
          {device.currIpAddress} - {device.classificationState}
          <Route path="/devices/:id" component={Device} />
        </li>
      ))}
    </div>
  );
};

export default DeviceList;
