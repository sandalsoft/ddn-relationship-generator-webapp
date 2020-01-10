import React from "react";
import {
  // HashRouter as Router,
  Route,
  Switch,
  Link,
  withRouter
} from "react-router-dom";
import { Breadcrumb } from "antd";

import { Error } from "../Error";
import DeviceList from "../Devices/device-list";
import DeviceReport from "../DeviceReport/device-report";
import DeviceDetail from "../Devices/DeviceDetail";
import App from "../../App";

// const Apps = () => (
//   <ul className="app-list">
//     <li>
//       <Link to="/apps/1">Application1</Link>：
//       <Link to="/apps/1/detail">Detail</Link>
//     </li>
//     <li>
//       <Link to="/apps/2">Application2</Link>：
//       <Link to="/apps/2/detail">Detail</Link>
//     </li>
//   </ul>
// );

const breadcrumbNameMap = {
  "/": "Home",
  "/report": "POV Report Generator",
  "/devices": "Devices"
};

const Header = withRouter(props => {
  const { location, state } = props;
  const pathSnippets = location.pathname.split("/").filter(i => i);

  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join(" > ")}`;
    return (
      <Breadcrumb.Item key={url}>
        <Link
          to={{
            pathname: url,
            state: {
              devices: state.devices
            }
          }}
        >
          {breadcrumbNameMap[url]}
        </Link>
        {/* <Link to={url}>{breadcrumbNameMap[url]}</Link> */}
      </Breadcrumb.Item>
    );
  });

  const breadcrumbItems = [
    <Breadcrumb.Item key="home">
      <Link to="/">Home</Link>
    </Breadcrumb.Item>
  ].concat(extraBreadcrumbItems);

  return (
    <div className="demo">
      <div className="demo-nav">
        <Link to="/">Home</Link>
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
      </div>
      <Breadcrumb>{breadcrumbItems}</Breadcrumb>
      <Switch>
        <Route exact path="/app" component={App} />
        <Route exact path="/devices" component={DeviceList} />
        <Route exact path="/devices/:id" component={DeviceDetail} />
        <Route exact path="/report" component={DeviceReport} />
        <Route component={Error} />
      </Switch>
    </div>
  );
});

export default Header;
