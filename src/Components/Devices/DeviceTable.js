import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Table, PageHeader, Icon, Modal } from "antd";
import { Tooltip } from "antd";
import Popup from "reactjs-popup";
import * as R from "ramda";
import getTimeString from "../../util/get-time-string";
import { isNulley } from "../../util";
import DeviceInfo from "./DeviceInfo";

const DeviceTable = props => {
  const history = useHistory();
  const [state, setState] = useState({
    isModalVisible: false,
    selectedDevice: {}
  });

  const showModal = (setState, record) => {
    return setState({
      isModalVisible: true,
      selectedDevice: record
    });
  };
  const hideModal = setState => {
    setState({ isModalVisible: false });
  };

  const devices = R.pathOr(
    [{ id: `no devices yet` }],
    [`history`, `location`, `state`, `devices`],
    props
  );

  const defaultColumnProps = {
    ellipsis: true,
    align: `center`
  };

  const columns = [
    {
      ...defaultColumnProps,
      title: "MAC",
      dataIndex: "macAddress",
      render: (text, row, index) => (text === `NOT_FOUND` ? `-` : text)
    },
    {
      ...defaultColumnProps,
      align: `left`,
      title: "IP Address",
      dataIndex: "currIpAddress",
      render: ipAddressRenderer
    },

    {
      ...defaultColumnProps,
      title: "Description",
      dataIndex: "deviceDescr",
      render: (text, row, index) => (text === `NOT_FOUND` ? `-` : text)
    },

    {
      ...defaultColumnProps,
      title: "FQDN",
      dataIndex: "fqdn",
      render: (text, row, index) => (text === `NOT_FOUND` ? `-` : text)
    },

    {
      ...defaultColumnProps,
      title: "Alarms",
      dataIndex: "alarmCount",
      render: (text, row, index) => (text === `NOT_FOUND` ? `-` : text)
    },
    {
      ...defaultColumnProps,
      title: <span>IoT Device</span>,
      dataIndex: "iotEndpoint",
      render: (text, row, index) =>
        text === `IOT_ENDPOINT` ? (
          <Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
        ) : (
          <Icon type="close-circle" theme="twoTone" twoToneColor="#ff1743" />
        )
    },

    {
      ...defaultColumnProps,
      title: "OS",
      dataIndex: "osType",
      render: (text, row, index) => (text === `NOT_FOUND` ? `-` : text)
    },

    {
      ...defaultColumnProps,
      title: "Classification Score",
      dataIndex: "classificationScore",
      render: (text, row, index) => (text === `NOT_FOUND` ? `-` : text)
    },

    {
      ...defaultColumnProps,
      title: "First Seen",
      dataIndex: "firstSeen",
      render: firstSeenHandler
    },

    {
      ...defaultColumnProps,
      title: "Last Seen",
      dataIndex: "lastSeen",
      render: (text, row, index) => (isNulley(text) ? `-` : getTimeString(text))
    }
  ];

  return (
    <div className="device-table-page-container">
      <PageHeader
        className="page-header"
        onBack={() => history.push(`/`, { devices })}
        title="Device List"
        subTitle="Environment updates in real-time"
      />

      <Modal
        title={`Device Details for ${state?.selectedDevice?.macAddress}`}
        maskAnimation="zoom"
        width="80%"
        visible={state.isModalVisible}
        centered={true}
        footer={null}
        mask={true}
        onOk={() => hideModal(setState)}
        onCancel={() => hideModal(setState)}
      >
        <DeviceInfo device={state.selectedDevice} />
      </Modal>

      <Table
        rowClassName="device-list-item"
        pagination={true}
        tableLayout="auto"
        columns={columns}
        dataSource={devices}
        rowKey="id"
        size="small"
        onRow={record => ({
          onClick: () => showModal(setState, record)
        })}
      />
    </div>
  );
};

export default DeviceTable;

const ipAddressRenderer = (text, row, index) => {
  const { lastIpUpdate } = row;
  const tooltipText = `IP last nupdated ${getTimeString(lastIpUpdate)}`;
  const cellText = text === `NOT_FOUND` ? `-` : text;
  return (
    <Tooltip mouseEnterDelay={0.5} title={tooltipText}>
      <span>{cellText}</span>
    </Tooltip>
  );
};

const firstSeenHandler = (text, row, index) => {
  const { firstSeen } = row;
  const cellText = `IP last \nupdated <br/>${getTimeString(firstSeen)}`;
  const tooltipText = text === `NOT_FOUND` ? `-` : getTimeString(firstSeen);
  return (
    <Popup
      mouseEnterDelay={500}
      trigger={<span>{tooltipText}</span>}
      on="hover"
      position="top center"
    >
      <div>{cellText}</div>
    </Popup>
  );
};
