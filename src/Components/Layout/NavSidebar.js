import React from "react";

import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import { Menu, Icon } from "antd";

const pathMenuKeyMapping = {
  "/report": `3`,
  "/devices": `2`,
  "/": `1`
};

const NavSidebar = props => {
  const { state } = props;
  const history = useHistory();

  const getPathFromKey = value =>
    Object.keys(pathMenuKeyMapping).find(
      key => pathMenuKeyMapping[key] === value
    );
  const getCurrentPathKey = history => {
    const { pathname } = history.location;
    return [pathMenuKeyMapping[pathname]];
  };

  const onClick = ({ item, key, keyPath, domEvent }) => {
    const pathname = getPathFromKey(key);
    history.push(pathname, {
      devices: state.devices
    });
  };

  return (
    <div className="sidebar">
      <Menu
        className="sidebar"
        defaultSelectedKeys={getCurrentPathKey(history)}
        mode="vertical"
        theme="light"
        onClick={onClick}
      >
        <Menu.Item
          key="1"
          title="Hause"
          style={{ ":hover": { backgroundColor: "#e2f6fa" } }}
        >
          <span className="nav-menu-item">
            <Icon type="home" />
            <Link to="/">Home</Link>
          </span>
        </Menu.Item>
        <Menu.Item key="2">
          <span className="nav-menu-item">
            <Icon type="ordered-list" />
            <Link
              to={{
                pathname: `/devices`,
                state: {
                  devices: state.devices,
                  isLoading: state.isLoading
                }
              }}
            >
              Devices ({state?.devices?.length})
            </Link>
          </span>
        </Menu.Item>
        <Menu.Item key="3">
          <span className="nav-menu-item">
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
