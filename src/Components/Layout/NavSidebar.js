import React from "react";

import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import { Menu, Icon } from "antd";

const NavSidebar = props => {
  const { state } = props;
  const history = useHistory();

  const onClick = ({ item, key, keyPath, domEvent }) => {
    switch (key) {
      case `1`:
        history.push(`/`, {
          devices: state.devices
        });
        break;
      case `2`:
        history.push(`/devices`, {
          devices: state.devices
        });
        break;
      case `3`:
        history.push(`/report`, {
          devices: state.devices
        });
        break;
      default:
        break;
    }
  };

  return (
    <div className="sidebar">
      <Menu
        defaultSelectedKeys={["1"]}
        defaultOpenKeys={["sub1"]}
        mode="vertical"
        theme="light"
        onClick={onClick}
      >
        <Menu.Item key="1" title="Hause">
          <span>
            <Icon type="home" />
            <Link to="/">Home</Link>
          </span>
        </Menu.Item>
        <Menu.Item key="2">
          <span>
            <Icon type="ordered-list" />
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
          </span>
        </Menu.Item>
        <Menu.Item key="3">
          <span>
            <Icon type="area-chart" />
            <Link
              to={{
                pathname: `/report`,
                state: {
                  devices: state.devices
                }
              }}
            >
              POV Report
            </Link>
          </span>
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default NavSidebar;
