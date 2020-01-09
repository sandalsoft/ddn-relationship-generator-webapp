const jetpack = require('fs-jetpack');
const path = require('path');

const findLeastNullPropsInObj = require('./find-least-null-props-in-obj');

const TestSandboxDir = `./test/find-least-null-props-in-obj`;
const TestFixtureDir = './test';
const TestFixtureFile = 'find-least-null-props-in-obj.table.json';

const TestTable = jetpack.read(path.join(TestFixtureDir, TestFixtureFile), 'json').testTable;


/* Enable mocking my uncommenting me
jest.mock('./find-least-null-props-in-obj', () =>
  Object.assign(require.requireActual('./find-least-null-props-in-obj'), {
   expect(findLeastNullPropsInObj(testValue)).toStrictEqual(expectedValue); // Object Deep Equal
   // expect(findLeastNullPropsInObj(testValue)).toMatch(expectedValue); //  String
   // expect(findLeastNullPropsInObj(testValue)).toBe(expectedValue); // strict equal, ie. ===
    ) 
  }) 
);
*/


// Table driven testing
test.each(TestTable)('findLeastNullPropsInObj(%p)', (testValue, expectedValue) => {
  expect(findLeastNullPropsInObj(testValue)).toBe(expectedValue);
});

