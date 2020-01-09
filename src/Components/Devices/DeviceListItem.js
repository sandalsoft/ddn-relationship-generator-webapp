import React from "react";
import { Link } from "react-router-dom";

const divStyle = {
  fontFamily: `Assistant", sans-serif`,
  fontSize: `20px`,
  color: `black`
};

const DeviceListItem = ({ data, index, style }) => {
  const device = data[index];

  return (
    <div style={divStyle}>
      {index}
      <Link
        to={{
          pathname: `/devices/${device.macAddress}`,
          state: {
            device
          }
        }}
      >
        {device.macAddress}
      </Link>
      - {device.fqdn}
    </div>
  );
};

export default DeviceListItem;
