import StorageObject from 'ember-local-storage/local/object';

const Storage = StorageObject.extend();

// Uncomment if you would like to set initialState
Storage.reopenClass({
  initialState() {
    return {
      lastWifi: false,
      lastConnected: null,
      settings: {
        language: 'en',
        about: {
          version: "0.5"
        },
        experience: {
          distanceUnits: "K",
          tempUnits: "C",
          displayAllData: false,
          displayLogs: false,
          darkModeAmbient: true,
          lightSensitivity: 6,
          darkModeHeadlights: true
        },
        notifications: {
          enablePush: true,
          tireHighThreshold: 42,
          tireLowThreshold: 32,
          tireDeltaThreshold: 2
        },
        bluetooth: {
          allow: true
        },
        wifi: {
          allow: true,
          port: 35000,
          ipaddress: "192.168.0.10"
        },
        experimental: {
          debugCodes: false,
          logOBDFile: false,
          logHistoryFile: true,
          historyInterval: 20000
        }
      }
    };
  }
});

export default Storage;
