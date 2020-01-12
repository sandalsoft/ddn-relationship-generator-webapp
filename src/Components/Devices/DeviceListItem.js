import React from "react";
import { Link } from "react-router-dom";

const DeviceListItem = ({ data, index, style }) => {
  const device = data[index];

  return (
    <div>
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
      {device.fqdn}
    </div>
  );
};

export default DeviceListItem;
