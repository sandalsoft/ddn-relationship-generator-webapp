import * as R from "ramda";
import React from "react";

import { FixedSizeList as List } from "react-window";
import DeviceListItem from "./DeviceListItem";

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

export default DeviceList;
