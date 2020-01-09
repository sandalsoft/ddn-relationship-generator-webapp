import * as R from "ramda";
import React from "react";
import { useHistory } from "react-router-dom";
import { Column, Table } from "react-virtualized";
import "react-virtualized/styles.css"; // only needs to be imported once
// import Rodal from "rodal";

// import { FixedSizeList as List } from "react-window";
// import DeviceListItem from "./DeviceListItem";

//
//
//            Used for Modal
//
//

// const [state, setState] = useState({ visible: false });
// console.log(`state: ${JSON.stringify(state)}`);
// const show = () => {
//   setState({ visible: true });
// };
// const hide = () => {
//   setState({ visible: false });
// };

// React.useEffect(() => {
//   console.log(`in effect state: ${JSON.stringify(state)}`);
// }, [state]);
const DeviceList = props => {
  const history = useHistory();

  const devices = R.pathOr(
    [{ macAddress: `no devices yet` }],
    [`history`, `location`, `state`, `devices`],
    props
  );

  const rowClassName = `device-list-item`;
  const headerClassName = `device-list-header`;
  const onRowClick = ({ event, index, rowData }) => {
    const device = rowData;
    console.log(`rowData: ${JSON.stringify(rowData.macAddress)}`);
    history.push(`/devices/${device.macAddress}`, { device });
  };

  return (
    <div className="DeviceList">
      Device List
      <Table
        height={700}
        width={900}
        headerHeight={20}
        rowHeight={35}
        rowCount={devices.length}
        headerClassName={headerClassName}
        rowClassName={rowClassName}
        onRowClick={onRowClick}
        rowGetter={({ index }) => devices[index]}
      >
        <Column label="Mac Address" dataKey="macAddress" width={100} />
        <Column width={300} label="FQDN" dataKey="fqdn" />
      </Table>
    </div>
  );
};

export default DeviceList;
