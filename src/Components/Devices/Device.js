import React from "react";

const Device = props => {
  const { device } = props.history.location.state;
  console.log(`device:\n\n ${JSON.stringify(device)}\n\n`);
  return <div>this is a device {device.macAddress}</div>;
};

export default Device;
