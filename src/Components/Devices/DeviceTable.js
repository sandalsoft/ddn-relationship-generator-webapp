import React from "react";
import { useHistory } from "react-router-dom";
import { Table } from "antd";
import { Tooltip } from "antd";
import * as R from "ramda";
import getTimeString from "../../util/get-time-string";
import { isNulley } from "../../util";

//  const onRowClick = ({ event, index, rowData }) => {
//    const device = rowData;
//    console.log(`rowData: ${JSON.stringify(rowData.macAddress)}`);
//    history.push(`/devices/${device.macAddress}`, { device });
//  };

const DeviceTable = props => {
  const history = useHistory();
  const devices = R.pathOr(
    [{ id: `no devices yet` }],
    [`history`, `location`, `state`, `devices`],
    props
  );
  const columns = [
    {
      title: "MAC",
      dataIndex: "macAddress",
      align: `center`,
      render: (text, row, index) => (text === `NOT_FOUND` ? `-` : text)
    },
    {
      title: "IP Address",
      dataIndex: "currIpAddress",
      align: `center`,
      render: ipAddressRenderer
    },

    {
      title: "Description",
      dataIndex: "deviceDescr",
      align: `center`,
      render: (text, row, index) => (text === `NOT_FOUND` ? `-` : text)
    },

    {
      title: "FQDN",
      dataIndex: "fqdn",
      align: `center`,
      render: (text, row, index) => (text === `NOT_FOUND` ? `-` : text)
    },

    {
      title: "Alarms",
      dataIndex: "alarmCount",
      align: `center`,
      render: (text, row, index) => (text === `NOT_FOUND` ? `-` : text)
    },
    {
      title: "is IoT?",
      dataIndex: "iotEndpoint",
      align: `center`,
      render: (text, row, index) => (text === `NOT_FOUND` ? `-` : text)
    },

    {
      title: "OS",
      dataIndex: "osType",
      align: `center`,
      render: (text, row, index) => (text === `NOT_FOUND` ? `-` : text)
    },

    {
      title: "Classification Score",
      dataIndex: "classificationScore",
      align: `center`,
      render: (text, row, index) => (text === `NOT_FOUND` ? `-` : text)
    },

    {
      title: "First Seen",
      dataIndex: "firstSeen",
      align: `center`,
      render: firstSeenHandler
    },

    {
      title: "Last Seen",
      dataIndex: "lastSeen",
      align: `center`,
      render: (text, row, index) => (isNulley(text) ? `-` : getTimeString(text))
    }
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={devices}
        size="small"
        render={(text, record, index) => {
          console.log(`index: ${JSON.stringify(index)}`);
          console.log(`text: ${JSON.stringify(text)}`);
          console.log(`record: ${JSON.stringify(record)}`);

          // return {
          //   onClick: event => {}, // click row
          //   onDoubleClick: event => {}, // double click row
          //   onContextMenu: event => {}, // right button click row
          //   onMouseEnter: event => {}, // mouse enter row
          //   onMouseLeave: event => {} // mouse leave row
          // };
        }}
      />
    </div>
  );
};

export default DeviceTable;

const ipAddressRenderer = (text, row, index) => {
  const { lastIpUpdate } = row;
  const tooltipText = `IP last \n\\nupdated ${getTimeString(lastIpUpdate)}`;
  const cellText = text === `NOT_FOUND` ? `-` : text;
  return (
    <Tooltip mouseEnterDelay={0.7} title={tooltipText}>
      <span>{cellText}</span>
    </Tooltip>
  );
};

const firstSeenHandler = (text, row, index) => {
  const { firstSeen } = row;
  const tooltipText = `IP last updated ${getTimeString(firstSeen)}`;
  const cellText = text === `NOT_FOUND` ? `-` : text;
  return (
    <Tooltip title={tooltipText}>
      <span>{cellText}</span>
    </Tooltip>
  );
};
