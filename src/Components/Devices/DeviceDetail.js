import React from "react";
import { JsonToTable } from "react-json-to-table";

const DeviceDetail = ({ device }) => {
  // const { device } = props.history.location.state;
  console.log(`device:\n\n ${JSON.stringify(device)}\n\n`);
  return (
    <div className="deviceDetail">
      <JsonToTable json={device} />
    </div>
  );
};

export default DeviceDetail;
