import React from "react";
import { Route, Switch, Link } from "react-router-dom";

// import DeviceReport from "./Components/DeviceReport/device-report";

import "./App.css";
import DeviceList from "./Components/Devices/device-list";
import Device from "./Components/Devices/Device";
import DeviceReport from "./Components/DeviceReport/device-report";
import { Error } from "./Components/Error";
import API from "@aws-amplify/api";

import PubSub from "@aws-amplify/pubsub";
import awsconfig from "./aws-exports";
// Configure Amplify
API.configure(awsconfig);
PubSub.configure(awsconfig);

const App = () => {
  // const deviceSummaryUpdatePath = [`value`, `data`, `onUpdateDeviceSummary`];

  return (
    <div className="App">
      App!
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/devices">Devices</Link>
        </li>
        <li>
          <Link to="/report">POV Report</Link>
        </li>
      </ul>
      <Switch>
        <Route exact path="/app" component={App} />
        <Route exact path="/devices" component={DeviceList} />
        <Route exact path="/devices/:id" component={Device} />
        <Route exact path="/report" component={DeviceReport} />
        <Route component={Error} />
      </Switch>
    </div>
  );
};

export default App;

// const createDeviceSub = async (appState, setState) => {
//   const deviceListCreatePath = [`value`, `data`, `onCreateDevice`];
//   await API.graphql(
//     graphqlOperation(onCreateDevice)
//     // @ts-ignore
//   ).subscribe({
//     next: createdDeviceData => {
//       console.log(
//         `appState.devices.length: ${JSON.stringify(appState.devices.length)}`
//       );
//       const newDevice = R.path(deviceListCreatePath)(createdDeviceData);
//       setState(prevState => [...prevState, newDevice]);
//       // setState({
//       //   devices: [...appState.devices, newDevice]
//       // });
//     }
//   });
// };

// const getQueryData = async (queryName, id, setState) => {
//   try {
//     const deviceSummaryQueryDataPath = [`data`, `getDeviceSummary`];
//     const queryResult = await API.graphql(graphqlOperation(queryName, { id }));
//     console.log(`queryResult: ${JSON.stringify(queryResult)}`);
//     const data = R.path(deviceSummaryQueryDataPath)(queryResult);
//     console.log(`data: ${JSON.stringify(data)}`);
//     setState({
//       totalDevices: data.totalDevices,
//       customerName: data.customerName
//     });
//   } catch (error) {
//     typeof error !== "string"
//       ? console.log(`Obj error: ${JSON.stringify(error)}`)
//       : console.log(`str error: ${error}`);
//     // console.log(`str error: ${error}`);
//   }
// };
