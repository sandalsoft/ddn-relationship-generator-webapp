import React from "react";

const Device = props => {
  const { device } = props.history.location.state;
  return <div>this is a device {device.macAddress}</div>;
};

export default Device;
