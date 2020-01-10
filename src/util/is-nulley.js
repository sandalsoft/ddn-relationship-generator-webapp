const R = require("ramda");

const isNulley = val => {
  if (!val) {
    return false;
  }
  return R.includes(val, [undefined, null, `NOT_FOUND`, `DEFAULT`]);
};

module.exports = isNulley;
