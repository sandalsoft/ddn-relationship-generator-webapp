import API, { graphqlOperation } from "@aws-amplify/api";
import PubSub from "@aws-amplify/pubsub";

import { createDevice } from "../../graphql/mutations";
import awsconfig from "../../aws-exports";

export const persistDataUsingAmplify = async () => {
  const device = fakeDevice;

  // Configure Amplify
  API.configure(awsconfig);
  PubSub.configure(awsconfig);
  try {
    const mutationResult = await API.graphql(
      graphqlOperation(createDevice, {
        input: device
      })
    );
    return {
      ok: true,
      value: mutationResult
    };
  } catch (error) {
    return {
      ok: false,
      error
    };
    // typeof error === `string`
    //   ? console.log(`str error: ${error}`)
    //   : console.log(`Obj error: ${JSON.stringify(error)}`);
  }
};

const fakeDevice = {
  autoGroupSets: "BOOOOYAH",
  avVendor: "NOT_FOUND",
  behaviorState: "NORMAL",
  blacklistEnforceStatus: "ENFORCEMENT_DISABLED",
  classificationProfileId: "3623",
  classificationSource: "PROFILE_LIB",
  classificationState: "Classified",
  criticality: "LEVEL_99",
  currIpAddress: "10.10.10.10",
  deviceCategory: "Physical Security Devices",
  deviceDescr: "Network Camera",
  deviceStatusFlags: "b110000110000000000000000000000000",
  deviceType: "Network Camera",
  deviceTypeImg: "images/generic-webcam.jpeg",
  dhcpHostname: "NOT_FOUND",
  dhcpOptions: "BOOOOYAH",
  dicomAETitle: "NOT_FOUND",
  encMethod: "NOT_FOUND",
  equipmentGuid: "2PME3JX8LP",
  fqdn: "axis-accc8e0a6926.chp.clarian.org",
  fwFlowBaselineEnforceStatus: "ENFORCEMENT_DISABLED",

  infobloxInfo: "BOOOOYAH",
  iotEndpoint: "IOT_ENDPOINT",
  knownVulnRiskState: "NORMAL",
  logoKey: "axiscomm-fc446ccf",
  longMfgName: "Axis Communications AB",
  macAddress: "AC:CC:8E:0A:69:26",
  mfgName: "AxisComm",
  modelNameNo: "AXIS M3004 M3004",
  osFamily: "NOT_FOUND",
  osSource: "NOT_FOUND",
  osSubFamily: "NOT_FOUND",
  osType: "NOT_FOUND",
  osVersion: "NOT_FOUND",
  passwdScanMap: "BOOOOYAH",
  portList: "BOOOOYAH",
  profileGuid: "Axis-M3004-Network Camera",
  profileMfg: "Axis",
  resolvedProfile: "BOOOOYAH",
  serialNo: "ACCC8E0A6926",
  siteGuid: "TNT-89CB1X98ASB1PXASG1O-DEFAULT",
  subnet: "10.16.48.0/24",
  swFlowBaselineEnforceStatus: "ENFORCEMENT_DISABLED",
  swVersion: "NOT_FOUND",
  tenantGuid: "TNT-89CB1X98ASB1PXASG1O",
  useState: "UNKNOWN",
  vlanName: "Vlan-48",
  whitelistStatus: "WHITELIST_DISABLED"
};
