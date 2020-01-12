import * as R from "ramda";
import React from "react";
import { Card, PageHeader } from "antd";
import { useHistory } from "react-router-dom";

const DeviceReport = props => {
  const devices = R.pathOr(
    [{ macAddress: `no devices yet` }],
    [`history`, `location`, `state`, `devices`],
    props
  );
  const history = useHistory();
  return (
    <div className="page-container">
      <PageHeader
        className="page-header"
        onBack={() => history.push(`/`, { devices })}
        title="POV Report"
        subTitle="Create a report showing a snapshot of the environment"
      />
      <Card title="POV Report Output" className="pov-report">
        <ul>customer Name: {props.customerName}</ul>
        <ul>totalDevices: {devices.length}</ul>
        <p>Card content</p>
      </Card>
    </div>
  );
};
export default DeviceReport;
