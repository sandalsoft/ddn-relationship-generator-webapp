import * as R from "ramda";
import PubSub from "@aws-amplify/pubsub";
import awsconfig from "./aws-exports";

import React, { useReducer, useEffect } from "react";
import { Route, Link, Switch } from "react-router-dom";
import API, { graphqlOperation } from "@aws-amplify/api";
import { onCreateDevice, onUpdateDevice } from "./graphql/subscriptions";
import { listDevices } from "./graphql/queries";

import { Error } from "./Components/Error";
import DeviceList from "./Components/Devices/device-list";
import DeviceReport from "./Components/DeviceReport/device-report";
import Device from "./Components/Devices/Device";

// Configure Amplify
API.configure(awsconfig);
PubSub.configure(awsconfig);

const ListDevicePaginationTokenPath = [`data`, `listDevices`, `nextToken`];
const ListDeviceSummaryQueryDataPath = [`data`, `listDevices`, `items`];

const App = () => {
  const reducer = (state, action) => {
    switch (action.type) {
      case `set`: {
        return {
          devices: [...action.devices]
        };
      }
      case "add": {
        return {
          devices: [...state.devices, ...action.devices]
        };
      }
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, {
    devices: []
  });

  useEffect(() => {
    getListData(listDevices, dispatch);
  }, []); // useEffect()

  useEffect(() => {
    deviceUpdateSub(state, dispatch);

    // createDeviceSub(state, dispatch);
    const deviceListCreatePath = [`value`, `data`, `onCreateDevice`];
    API.graphql(
      graphqlOperation(onCreateDevice)
      // @ts-ignore
    ).subscribe({
      next: createdDeviceData => {
        const newDevice = R.path(deviceListCreatePath)(createdDeviceData);
        //@ts-ignore
        dispatch({ type: `add`, devices: [...newDevice] });
      }
    });
  }, [state]); // useEffect()

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
                devices: state.devices
              }
            }}
          >
            Devices ({state?.devices?.length})
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
const getListData = async (listQuery, dispatch) => {
  try {
    const deviceList = await fetchAllDevices(dispatch, listQuery);
    dispatch({ type: `set`, devices: deviceList });
  } catch (error) {
    typeof error === "string"
      ? console.log(`Obj error: ${error}`)
      : console.log(`str error: ${error}`);
    // console.log(`str error: ${error}`);
  }
};

const deviceUpdateSub = async (state, dispatch) => {
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
      dispatch({
        type: `add`,
        devices: [...state.devices, ...updatedDevice]
      });
    }
  });
};

const fetchData = async (query, params) =>
  await API.graphql(graphqlOperation(query, params));

const fetchAllDevices = async (dispatch, query, nextToken) => {
  try {
    const limit = 1000;

    let params;
    if (nextToken) {
      params = {
        limit,
        nextToken
      };
    } else {
      params = { limit };
    }
    const results = await fetchData(query, params);
    const devices = pluckDevicesFromResults(results);

    dispatch({
      type: `add`,
      devices: [...devices]
    });

    console.log(`Fetching more devices...: ${devices.length}`);
    if (hasMoreDevices(results)) {
      const nextToken = pluckFromResults(
        ListDevicePaginationTokenPath,
        results
      );
      const totalDevices = [
        ...devices,
        ...(await fetchAllDevices(dispatch, listDevices, nextToken))
      ];
      console.log(`totalDevices.length: ${totalDevices.length}`);
      return totalDevices;
    } else {
      console.log(`noMoreDevices, returning ${devices.length}`);
      return devices;
    }
  } catch (error) {
    console.log(`error in fetchAllDevices`);

    typeof error !== "string"
      ? console.log(`error: ${error}`)
      : console.log(`error: ${JSON.stringify(error)}`);
  }
};

const hasMoreDevices = results =>
  !R.isNil(pluckFromResults(ListDevicePaginationTokenPath, results));

const pluckDevicesFromResults = results =>
  pluckFromResults(ListDeviceSummaryQueryDataPath, results);

const pluckFromResults = (path, results) => R.path(path)(results);
