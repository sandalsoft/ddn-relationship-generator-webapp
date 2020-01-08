import * as R from "ramda";
import { Route, Link } from "react-router-dom";
import API, { graphqlOperation } from "@aws-amplify/api";
import React, { useState, useEffect } from "react";
import {
  onCreateDevice,
  onUpdateDevice
  // onUpdateDeviceSummary,
  // onCreateDeviceSummary
} from "../../graphql/subscriptions";

import {
  // getDeviceSummary,
  listDevices
} from "../../graphql/queries";
import Device from "./Device";

const DeviceList = props => {
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

  // const devices = props?.devices?.length > 0 ? props.devices : [{}];
  const devices = appState.devices;
  return (
    <div>
      Device List
      <br />
      {devices.map(device => (
        <li key={device.macAddress}>
          <Link
            to={{
              pathname: `/devices/${device.macAddress}`,
              state: {
                device
              }
            }}
          >
            {" "}
            {device.macAddress}
          </Link>
          - {device.macAddress} - {device.osType} - {device.osFamily} -{" "}
          {device.classificationScore} - {device.dhcpHostname} -{" "}
          {device.currIpAddress} - {device.classificationState}
          <Route path="/devices/:id" component={Device} />
        </li>
      ))}
    </div>
  );
};

export default DeviceList;

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
