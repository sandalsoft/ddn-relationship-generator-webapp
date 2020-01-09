const R = require("ramda");

const byNullkeyPct = (a, b) => a.nullKeyPct - b.byNullkeyPct;
const bynumNonNullKeys = (a, b) => a.numNonNullKeys - b.numNonNullKeys;

const findLeastNullPropsInObj = ([objects]) => {
  const stats = R.map(nullsInObj, objects);
  const sortedByPct = R.sort(byNullkeyPct, stats);
  const sortedByNonNullKeys = R.sort(bynumNonNullKeys, stats);
  console.log(`sortedByPct: ${JSON.stringify(sortedByPct)}`);
  console.log(`\n\n\n`);
  console.log(`sortedByNonNullKeys: ${JSON.stringify(sortedByNonNullKeys)}`);
  console.log(`\n\n\n`);
  console.log(`\n\n\n`);
};

const nullsInObj = obj => {
  const keys = R.keys(obj);
  const nonNullKeys = R.filter(R.not(R.isNil), keys);
  const numKeys = keys.length;
  const numNullKeys = keys.legnth - nonNullKeys.length;
  const numNonNullKeys = nonNullKeys.length;
  const nullKeyPct = numNullKeys / numKeys;
  return {
    id: obj.id,
    numKeys,
    numNullKeys,
    numNonNullKeys,
    nullKeyPct
  };
};

module.exports = findLeastNullPropsInObj;
