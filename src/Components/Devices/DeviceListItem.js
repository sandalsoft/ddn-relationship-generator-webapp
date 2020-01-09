import React from "react";
import { Link } from "react-router-dom";

const DeviceListItem = ({ data, index, style }) => {
  const device = data[index];

  return (
    <div className="device-list-item" style={style}>
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
