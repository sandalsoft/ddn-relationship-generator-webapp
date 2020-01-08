# AppSync Console Queries

### Delete Mutation

```

```

##3 delete variable

```
{
  "input": {
    "id": "102"
  }
}
```

### Query Mutation

```
query GetDeviceSummary($id: ID!) {
  getDeviceSummary(id: $id) {
    customerName
    deviceList
    id
    threatList
    totalDevices
  }
}
```

### Query Variables

```
{
  "id": "Dayton"
}
```

### CreateDeviceSummary

```
mutation CreateDeviceSummary($input: CreateDeviceSummaryInput!, $condition: ModelDeviceSummaryConditionInput) {
  createDeviceSummary(input: $input, condition: $condition) {
    customerName
    deviceList
    id
    threatList
    totalDevices
  }
}


```

## CreateDevice variables

```
{
  "input": {
    "id": "Dayton",
    "customerName": "Dayton",
    "totalDevices": 66,
    "deviceList": [
      "{\"Medical Devices\": 11}",
      "{\"Servers\":22}",
      "{\"IPv6 Enabled Toilets\": 33}"
    ]
  }
}
```

### UpdateDeviceSummary Mutation

```
mutation UpdateDeviceSummary($input: UpdateDeviceSummaryInput!, $condition: ModelDeviceSummaryConditionInput) {
  updateDeviceSummary(input: $input, condition: $condition) {
    customerName
    deviceList
    id
    threatList
    totalDevices
  }
}
```

### UpdateDeviceSummary variable

```
{
  "input": {
    "id": "Dayton",
    "customerName": "Dayton",
    "totalDevices": 66,
    "deviceList": [
      "{\"Medical Devices\": 11}",
      "{\"Servers\":22}",
      "{\"IPv6 Enabled Toilets\": 33}"
    ]
  }
}
```

## CreateDevice mutation

```
mutation CreateDevice(
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
    lastSeenPort
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
```

### CreateDevice variable

```
{
  "input": {
    		"macAddress": "F4:8E:38:79:1D:F6",
        "siteGuid": "TNT-89CB1X98ASB1PXASG1O-DEFAULT",
        "tenantGuid": "TNT-89CB1X98ASB1PXASG1O",
        "adminClassified": false,
        "alarmCount": 7412,
        "behaviorState": "LOW",
        "blacklistEnforceStatus": "ENFORCEMENT_DISABLED",
        "blockAllExternalFlows": false,
        "classificationProfileId": "4439",
        "classificationScore": 85,
        "classificationSource": "PROFILE_LIB",
        "classificationState": "Classified",
        "criticality": "LEVEL_3",
        "currIpAddress": "10.168.201.84",
        "currentUser": "bedrepairs",
        "currentUserAccountName": "bedrepairs",
        "deleteDevice": false,
        "deviceCategory": "Workstations",
        "deviceDescr": "Workstation",
        "deviceStatusFlags": "a1110101100000001001001100",
        "deviceType": "Workstation",
        "deviceTypeDerived": false,
        "deviceTypeImg": "images/Workstations.png",
        "dhcpHostname": "G06905",
        "droppingVectors": true,
        "equipmentGuid": "BPTGKFJYCX",
        "firstSeen": 1563894193196,
        "fqdn": "g06905.suhtad.suht.swest.nhs.uk",
        "fwFlowBaselineEnforceStatus": "ENFORCEMENT_DISABLED",
        "groupList": [
          "Vlan-Group-default",
          "Workstations",
          "Subnet-Group-default"
        ],
        "guestDevice": false,
        "hasADInfo": false,
        "hasAlarms": true,
        "hasAntivirus": true,
        "hasAssetTag": false,
        "hasClearedAlarms": false,
        "hasDeviceAppsInfo": false,
        "hasExternalFlows": true,
        "hasFlowVectors": true,
        "hasInternalFlows": true,
        "hasPhiData": false,
        "hasUserDetails": true,
        "incidentScore": 0,
        "iotEndpoint": "NONIOT_ENDPOINT",
        "ipAddress": ["n/a"],
        "isAgedOut": true,
        "isBlacklisted": false,
        "isDhcp": true,
        "isDicomDest": false,
        "knownVulnRiskState": "CRITICAL",
        "lastIpUpdate": 1570696559324,
        "lastOfflineTs": 1570819175641,
        "lastSeen": 0,
        "lastUnUsedTs": 0,
        "logoKey": "dellinc-ff5d7df2",
        "longMfgName": "Dell Inc.",
        "mfgName": "DellInc",
        "modelNameNo": "Windows",
        "osFamily": "Windows 7",
        "osSource": "NETBIOS",
        "osSubFamily": "n/a",
        "osType": "Windows 7 ",
        "osVersion": "6.1",
        "profileGuid": "Dell-Windows-Workstation",
        "profileList": [
          "Subnet-10.168.201.0/24",
          "default",
          "Dell-Windows-Workstation"
        ],
        "profileMfg": "Dell",
        "proxied": false,
        "proxy": false,
        "recomputeMds2Info": true,
        "recomputeVulnerabilities": false,
        "riskScore": 2,
        "subnet": "10.168.201.0/24",
        "swFlowBaselineEnforceStatus": "ENFORCEMENT_DISABLED",
        "useState": "UNKNOWN",
        "vlan": 1,
        "vlanName": "default",
        "vulnIds": ["CVE-2019-0708"],
        "whitelistStatus": "WHITELIST_DISABLED"
      }
}
```
