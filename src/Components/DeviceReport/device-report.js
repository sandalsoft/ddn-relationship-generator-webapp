import * as R from "ramda";
import React from "react";
import { Link } from "react-router-dom";
// import { Row, Col } from "react-flex-proto";

// const renderBreadcrumbs = () => {
//   return (
//     <Breadcrumbs>
//       <Link to="/">Home</Link>
//       POV Report
//     </Breadcrumbs>
//   );
// };

const DeviceReport = props => {
  const devices = R.pathOr(
    [{ macAddress: `no devices yet` }],
    [`history`, `location`, `state`, `devices`],
    props
  );

  return (
    <div className="pov-report">
      <ul>customer Name: {props.customerName}</ul>
      <ul>totalDevices: {devices.length}</ul>
    </div>
    // <Page actionBar={renderBreadcrumbs()} title="Table Types">
    //   <Panel title="Table with Hover Effect">
    //     <h5>POV Report</h5>
    //     <div className="pov-report">
    //       <ul>customer Name: {props.customerName}</ul>
    //       <ul>totalDevices: {devices.length}</ul>
    //     </div>
    //   </Panel>
    // </Page>
  );
};

//  const fetchData = async() => {
//         const {data} = await axios('https://jsonplaceholder.typicode.com/todos/1');
//         setAppState({totalDevices: data.id});
//       }

export default DeviceReport;
