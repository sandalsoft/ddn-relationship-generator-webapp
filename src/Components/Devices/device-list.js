import React from "react";

const DeviceList = props => {
  // console.log(`<DeviceList props: ${JSON.stringify(props)}`);
  // const devices = props.length > 0 ? props : [];
  const devices = props.devices.length > 0 ? props.devices : [{}];
  return (
    <div>
      {devices.map(device => (
        <li key={device.id}>
          {device.id} - {device.macAddress} - {device.osType} -{" "}
          {device.osFamily} - {device.classificationScore} -{" "}
          {device.dhcpHostname} - {device.currIpAddress} -{" "}
          {device.classificationState}
        </li>
      ))}
    </div>
  );
};

export default DeviceList;
