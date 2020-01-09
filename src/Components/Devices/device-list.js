import * as R from "ramda";
import React, { useState } from "react";
// import Rodal from "rodal";

import { FixedSizeList as List } from "react-window";
import DeviceListItem from "./DeviceListItem";

const DeviceList = props => {
  //
  //
  //            Used for Modal
  //
  //

  // const [state, setState] = useState({ visible: false });
  // console.log(`state: ${JSON.stringify(state)}`);
  // const show = () => {
  //   setState({ visible: true });
  // };
  // const hide = () => {
  //   setState({ visible: false });
  // };

  // React.useEffect(() => {
  //   console.log(`in effect state: ${JSON.stringify(state)}`);
  // }, [state]);

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
    <div className="DeviceList">
      Device List
      <List itemData={devices} {...listProps}>
        {DeviceListItem}
      </List>
    </div>
  );
};

export default DeviceList;
