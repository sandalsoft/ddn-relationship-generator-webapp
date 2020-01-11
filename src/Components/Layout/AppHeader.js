import React from "react";
import { withRouter } from "react-router-dom";
import logo from "./ordr-logo.png";

const AppHeader = withRouter(props => {
  const imgStyle = {
    width: `100px`,
    height: `100%`
  };

  return (
    <div className="header">
      <div>
        <img style={imgStyle} src={logo} alt="ordr" />
      </div>
    </div>
  );
});

export default AppHeader;
