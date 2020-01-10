import React from "react";

const CustomerForm = props => {
  const { object } = props.history.location.state;

  return <div>this is an object {object.prop}</div>;
};

export default CustomerForm;
