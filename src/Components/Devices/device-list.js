import * as R from "ramda";
import React from "react";
import { Link } from "react-router-dom";
import { FixedSizeList as List } from "react-window";

const DeviceList = props => {
  const devices = R.pathOr(
    [{ macAddress: `no devices yet` }],
    [`history`, `location`, `state`, `devices`],
    props
  );

  const listProps = {
    height: 500,
    itemCount: devices.length,
    itemSize: 35,
    width: `75%`
  };

  return (
    <div>
      Device List
      <br />
      <List itemData={devices} {...listProps}>
        {DeviceListItem}
      </List>
    </div>
  );
};

const DeviceListItem = ({ data, index, style }) => {
  const device = data[index];

  return (
    <div style={style}>
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

export default DeviceList;
