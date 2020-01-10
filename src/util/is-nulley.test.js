const jetpack = require('fs-jetpack');
const path = require('path');

const isNulley = require('./is-nulley');

const TestSandboxDir = `./test/is-nulley`;
const TestFixtureDir = './test';
const TestFixtureFile = 'is-nulley.table.json';

const TestTable = jetpack.read(path.join(TestFixtureDir, TestFixtureFile), 'json').testTable;


/* Enable mocking my uncommenting me
jest.mock('./is-nulley', () =>
  Object.assign(require.requireActual('./is-nulley'), {
   expect(isNulley(testValue)).toStrictEqual(expectedValue); // Object Deep Equal
   // expect(isNulley(testValue)).toMatch(expectedValue); //  String
   // expect(isNulley(testValue)).toBe(expectedValue); // strict equal, ie. ===
    ) 
  }) 
);
*/


// Table driven testing
test.each(TestTable)('isNulley(%p)', (testValue, expectedValue) => {
  expect(isNulley(testValue)).toBe(expectedValue);
});

