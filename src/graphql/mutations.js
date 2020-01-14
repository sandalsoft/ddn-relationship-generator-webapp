/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createDeviceSummary = `mutation CreateDeviceSummary(
  $input: CreateDeviceSummaryInput!
  $condition: ModelDeviceSummaryConditionInput
) {
  createDeviceSummary(input: $input, condition: $condition) {
    customerName
    deviceList
    id
    threatList
    totalDevices
  }
}
`;
export const updateDeviceSummary = `mutation UpdateDeviceSummary(
  $input: UpdateDeviceSummaryInput!
  $condition: ModelDeviceSummaryConditionInput
) {
  updateDeviceSummary(input: $input, condition: $condition) {
    customerName
    deviceList
    id
    threatList
    totalDevices
  }
}
`;
export const deleteDeviceSummary = `mutation DeleteDeviceSummary(
  $input: DeleteDeviceSummaryInput!
  $condition: ModelDeviceSummaryConditionInput
) {
  deleteDeviceSummary(input: $input, condition: $condition) {
    customerName
    deviceList
    id
    threatList
    totalDevices
  }
}
`;
export const createDevice = `mutation CreateDevice(
  $input: CreateDeviceInput!
  $condition: ModelDeviceConditionInput
) {
  createDevice(input: $input, condition: $condition) {
    id
    adUsers
    threats
    alarmInfos
    flows
    medicalUtilizationRecords
    _createdAt
    _updatedAt
    adminClassified
    alarmCount
    alarmInfoMap
    assetSgt
    autoGroupSets
    avMatchScore
    avVendor
    behaviorState
    blacklistEnforceStatus
    blockAllExternalFlows
    certInfo
    classificationProfileId
    classificationScore
    classificationSource
    classificationState
    classifyInProgress
    criticality
    currIpAddress
    currentUser
    currentUserAccountName
    customerName
    deleteDevice
    deviceCategory
    deviceDescr
    deviceStatusFlags
    deviceType
    deviceTypeDerived
    deviceTypeImg
    dhcpClassId
    dhcpHostname
    dhcpOptions
    dhcpPresent
    dicomAETitle
    dontInherit
    droppingVectors
    encMethod
    entityType
    equipmentGuid
    evalBehaviorAnomalies
    finalSgt
    firstSeen
    fqdn
    fwFlowBaselineEnforceStatus
    groupList
    guestDevice
    hasADInfo
    hasAlarms
    hasAntivirus
    hasAssetTag
    hasClearedAlarms
    hasDeviceAppsInfo
    hasExternalFlows
    hasFlowVectors
    hasInternalFlows
    hasPhiData
    hasUserDetails
    incidentScore
    infobloxInfo
    iotEndpoint
    ipAddress
    ipBindingExpiryTime
    isAgedOut
    isBlacklisted
    isDhcp
    isDicomDest
    knownVulnRiskState
    lastDigProbeScan
    lastHttpScan
    lastIpUpdate
    lastOfflineTs
    lastPasswdScan
    lastRapid7VulnScan
    lastSeen
    lastTenableVulnScan
    lastUnUsedTs
    lastUsed
    lastVulnScan
    logoKey
    longMfgName
    macAddress
    mfgName
    modelNameNo
    openPorts
    osFamily
    osSource
    osSubFamily
    osType
    osVersion
    packetSgt
    passwdScanMap
    portList
    profileGuid
    profileList
    profileMfg
    proxied
    proxy
    recomputeMds2Info
    recomputeVulnerabilities
    resolvedProfile
    riskScore
    serialNo
    siteGuid
    strictEnforcement
    subnet
    swFlowBaselineEnforceStatus
    swVersion
    tags
    tenantGuid
    useState
    vlan
    vlanName
    vulnIds
    vulnScanCounter
    whitelistStatus
  }
}
`;
export const updateDevice = `mutation UpdateDevice(
  $input: UpdateDeviceInput!
  $condition: ModelDeviceConditionInput
) {
  updateDevice(input: $input, condition: $condition) {
  alarmCount
  currIpAddress
  fqdn
  iotEndpoint
    osType
    classificationScore
    firstSeen
    lastSeen
  }
}
`;
export const deleteDevice = `mutation DeleteDevice(
  $input: DeleteDeviceInput!
  $condition: ModelDeviceConditionInput
) {
  deleteDevice(input: $input, condition: $condition) {
    id
   
  }
}
`;
