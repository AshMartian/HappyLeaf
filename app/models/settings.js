import DS from 'ember-data';

const {
  Model,
  attr,
  hasMany
} = DS;

export default Model.extend({
  name: attr('string'),
  lastWifi: attr('bool'),
  lastConnected: attr(),
  settings: {
    language: attr('string'),
    about: {
      version: attr('string')
    },
    experience: {
      displayAllData: attr('bool'),
      displayLogs: attr('bool'),
      darkModeAmbient: attr('bool'),
      lightSensitivity: attr('number'),
      darkModeHeadlights: attr('bool')
    },
    notifications: {
      enablePush: attr('bool'),
      tireHighThreshold: attr('number'),
      tireLowThreshold: attr('number'),
      tireDeltaThreshold: attr('number')
    },
    bluetooth: {
      allow: attr('bool')
    },
    wifi: {
      allow: attr('bool'),
      port: attr('number'),
      ipaddress: attr('string')
    },
    experimental: {
      debugCodes: attr('bool'),
      logOBDFile: attr('bool'),
      logHistoryFile: attr('bool')
    }
  }
});
