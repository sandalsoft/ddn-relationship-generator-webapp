const jetpack = require('fs-jetpack');
const path = require('path');

const getTimeString = require('./get-time-string');

const TestSandboxDir = `./test/get-time-string`;
const TestFixtureDir = './test';
const TestFixtureFile = 'get-time-string.table.json';

const TestTable = jetpack.read(path.join(TestFixtureDir, TestFixtureFile), 'json').testTable;


/* Enable mocking my uncommenting me
jest.mock('./get-time-string', () =>
  Object.assign(require.requireActual('./get-time-string'), {
   expect(getTimeString(testValue)).toStrictEqual(expectedValue); // Object Deep Equal
   // expect(getTimeString(testValue)).toMatch(expectedValue); //  String
   // expect(getTimeString(testValue)).toBe(expectedValue); // strict equal, ie. ===
    ) 
  }) 
);
*/


// Table driven testing
test.each(TestTable)('getTimeString(%p)', (testValue, expectedValue) => {
  expect(getTimeString(testValue)).toBe(expectedValue);
});

