import * as R from "ramda";
import React from "react";
import { useHistory } from "react-router-dom";
import { Column, Table } from "react-virtualized";
import getTimeString from "../../util/get-time-string";

import "react-virtualized/styles.css"; // only needs to be imported once

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
        width={1400}
        headerHeight={20}
        rowHeight={35}
        rowCount={devices.length}
        headerClassName={headerClassName}
        rowClassName={rowClassName}
        onRowClick={onRowClick}
        rowGetter={({ index }) => devices[index]}
      >
        <Column
          width={120}
          label="MAC"
          dataKey="macAddress"
          cellRenderer={({ cellData }) =>
            cellData === `NOT_FOUND` ? `-` : cellData
          }
        />
        <Column
          width={100}
          label="IP Address"
          dataKey="currIpAddress"
          cellRenderer={({ cellData }) =>
            cellData === `NOT_FOUND` ? `-` : cellData
          }
        />
        <Column
          width={160}
          label="Description"
          dataKey="deviceDescr"
          cellRenderer={({ cellData }) =>
            cellData === `NOT_FOUND` ? `-` : cellData
          }
        />
        <Column
          width={200}
          label="FQDN"
          dataKey="fqdn"
          cellRenderer={({ cellData }) =>
            cellData === `NOT_FOUND` ? `-` : cellData
          }
        />
        <Column
          width={54}
          label="Alarms"
          dataKey="alarmCount"
          cellRenderer={({ cellData }) => (cellData === null ? `-` : cellData)}
        />
        <Column
          width={47}
          label="is IoT?"
          dataKey="iotEndpoint"
          cellRenderer={({ cellData }) =>
            cellData === `IOT_ENDPOINT` ? `Yes` : `No`
          }
        />
        <Column
          width={150}
          label="OS"
          dataKey="osType"
          cellRenderer={({ cellData }) => (cellData === null ? `-` : cellData)}
        />
        <Column
          width={150}
          label="Classification Score"
          dataKey="classificationScore"
          cellRenderer={({ cellData }) => (cellData === null ? `-` : cellData)}
        />
        <Column
          width={150}
          label="First Seen"
          dataKey="firstSeen"
          cellRenderer={({ cellData }) =>
            cellData === null ? `-` : getTimeString(cellData)
          }
        />
        <Column
          width={150}
          label="Last Seen"
          dataKey="lastSeen"
          cellRenderer={({ cellData }) =>
            cellData === null ? `-` : getTimeString(cellData)
          }
        />
      </Table>
    </div>
  );
};

export default DeviceList;
