import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Table, PageHeader, Icon, Modal } from "antd";
import { Tooltip } from "antd";
import Popup from "reactjs-popup";
import * as R from "ramda";
import getTimeString from "../../util/get-time-string";
import { isNulley } from "../../util";
import DeviceInfo from "./DeviceInfo";
// import DeviceDetail from "./DeviceDetail";

const DeviceTable = props => {
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
      className: `white-background`,
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
      title: <span>IoT Device</span>,
      dataIndex: "iotEndpoint",
      align: `center`,
      render: (text, row, index) =>
        text === `IOT_ENDPOINT` ? (
          <Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
        ) : (
          <Icon type="close-circle" theme="twoTone" twoToneColor="#ff1743" />
        )
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
      <PageHeader
        className="page-header"
        onBack={() => history.push(`/`, { devices })}
        title="Device List"
        subTitle="Environment changes update in real-time"
      />

      <Modal
        title={`Device Details for ${state?.selectedDevice?.macAddress}`}
        maskAnimation="fade"
        width="80%"
        style={{ top: 20 }}
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
        rowClassName="white-background"
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
