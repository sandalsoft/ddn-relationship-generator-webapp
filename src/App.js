import * as R from "ramda";
import PubSub from "@aws-amplify/pubsub";
import awsconfig from "./aws-exports";

import React, { useState, useEffect } from "react";
import { Route, Link, Switch } from "react-router-dom";
import API, { graphqlOperation } from "@aws-amplify/api";
import {
  onCreateDevice,
  onUpdateDevice
  // onUpdateDeviceSummary,
  // onCreateDeviceSummary
} from "./graphql/subscriptions";
import { listDevices } from "./graphql/queries";

import { Error } from "./Components/Error";
import DeviceList from "./Components/Devices/device-list";
import DeviceReport from "./Components/DeviceReport/device-report";
import Device from "./Components/Devices/Device";

// Configure Amplify
API.configure(awsconfig);
PubSub.configure(awsconfig);
const App = () => {
  // const DeviceList = props => {
  const [appState, setAppState] = useState({
    devices: []
  });

  useEffect(() => {
    getListData(listDevices, setAppState);
  }, []); // useEffect()

  useEffect(() => {
    deviceUpdateSub(appState, setAppState);
    // createDeviceSub(appState, setAppState);
    const deviceListCreatePath = [`value`, `data`, `onCreateDevice`];
    API.graphql(
      graphqlOperation(onCreateDevice)
      // @ts-ignore
    ).subscribe({
      next: createdDeviceData => {
        console.log(
          `in onCreate fire - appState.devices.length: ${JSON.stringify(
            appState.devices.length
          )}`
        );
        const newDevice = R.path(deviceListCreatePath)(createdDeviceData);
        const newState = {
          devices: [newDevice, ...appState.devices]
        };
        setAppState(newState);
      }
    });
  }, [appState]); // useEffect()

  console.log(
    `in App - appState.devices.length: ${JSON.stringify(
      appState.devices.length
    )}`
  );

  return (
    <div className="App">
      (Dev notes: alarmInfos and CertInfo props on Devices are broken)
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link
            to={{
              pathname: `/devices`,
              state: {
                devices: appState.devices
              }
            }}
          >
            Devices
          </Link>
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

const getListData = async (listQuery, setState) => {
  try {
    // await persistDataUsingAmplify();
    const deviceSummaryQueryDataPath = [`data`, `listDevices`, `items`];
    const queryResult = await API.graphql(
      graphqlOperation(listQuery, {
        limit: 100
      })
    );
    const deviceList = R.path(deviceSummaryQueryDataPath)(queryResult);
    setState({
      devices: deviceList
    });
  } catch (error) {
    typeof error !== "string"
      ? console.log(`Obj error: ${JSON.stringify(error)}`)
      : console.log(`str error: ${error}`);
    // console.log(`str error: ${error}`);
  }
};

const deviceUpdateSub = async (appState, setState) => {
  const deviceListUpdatePath = [`value`, `data`, `onUpdateDevice`];
  await API.graphql(
    graphqlOperation(onUpdateDevice)
    // @ts-ignore
  ).subscribe({
    next: deviceUpdateData => {
      const updatedDevice = R.path(deviceListUpdatePath)(deviceUpdateData);
      console.log(
        `onDeviceUpdate data: ${JSON.stringify(updatedDevice.macAddress)}`
      );
      setState({
        devices: [...appState.devices, updatedDevice]
      });
    }
  });
};
