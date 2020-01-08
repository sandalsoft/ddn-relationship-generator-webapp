import React from "react";

const DeviceReport = props => {
  //   const [appState, setAppState] = useState({ totalDevices: -1183 });
  //   useEffect(() => {
  //     let ignore;
  //     fetchData();
  //     return () => { ignore = true; }
  //   });
  return (
    <div>
      <ul>customer Name: {props.customerName}</ul>
      <ul>totalDevices: {props.totalDevices}</ul>
    </div>
  );
};

//  const fetchData = async() => {
//         const {data} = await axios('https://jsonplaceholder.typicode.com/todos/1');
//         setAppState({totalDevices: data.id});
//       }

export default DeviceReport;
