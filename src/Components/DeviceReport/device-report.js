import * as R from "ramda";
import React from "react";

const DeviceReport = props => {
  const devices = R.pathOr(
    [{ macAddress: `no devices yet` }],
    [`history`, `location`, `state`, `devices`],
    props
  );

  console.log();
  console.log();
  console.log(`${JSON.stringify(devices)}`);
  console.log();
  console.log();
  console.log();

  return (
    <div>
      <ul>customer Name: {props.customerName}</ul>
      <ul>totalDevices: {devices.length}</ul>
    </div>
  );
};

//  const fetchData = async() => {
//         const {data} = await axios('https://jsonplaceholder.typicode.com/todos/1');
//         setAppState({totalDevices: data.id});
//       }

export default DeviceReport;
