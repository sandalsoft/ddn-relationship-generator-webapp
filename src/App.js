import * as R from "ramda";
import React, {
  useState,
  useEffect
  // useReducer
} from "react";
import API, { graphqlOperation } from "@aws-amplify/api";

import PubSub from "@aws-amplify/pubsub";
import {
  onCreateDevice,
  onUpdateDevice
  // onUpdateDeviceSummary,
  // onCreateDeviceSummary
} from "./graphql/subscriptions";

// import DeviceReport from "./Components/DeviceReport/device-report";
import {
  // getDeviceSummary,
  listDevices
} from "./graphql/queries";
import awsconfig from "./aws-exports";

import "./App.css";
import DeviceList from "./Components/Devices/device-list";
// import { persistDataUsingAmplify } from "./Components/Devices/persist-data-using-amplify";

// Configure Amplify
API.configure(awsconfig);
PubSub.configure(awsconfig);

// const usePrevious = value => {
//   const ref = useRef();
//   useEffect(() => {
//     ref.current = value;
//   });
//   return ref.current;
// };

const App = () => {
  // const deviceSummaryUpdatePath = [`value`, `data`, `onUpdateDeviceSummary`];

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
  if (!appState.devices) {
    return <div>Loading...</div>;
  } else {
    return (
      <div className="App">
        {/* <DeviceReport
          totalDevices={appState.totalDevices}
          customerName={appState.customerName}
        /> */}
        <br />
        <DeviceList devices={appState.devices} />
      </div>
    );
  }
}; // App()

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
