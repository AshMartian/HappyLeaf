import Ember from 'ember';
import { storageFor } from 'ember-local-storage';

var tempStore = [];
var voltageStore = [];
var averageLogs = {};
var GIDsConfirmed = false;
var tripStore = {};

export default Ember.Service.extend({
  settings: storageFor('settings'),
  history: storageFor('history'),

  init() {
    this._super();

    var currentTripStart = this.get('history.lastState');
    
    Object.keys(currentTripStart).forEach((key) => {
        this.set(key, currentTripStart[key]);
    });
  },

  flowManager: Ember.inject.service('flow-manager'),
  logManager: Ember.inject.service('log-manager'),
  storageManager: Ember.inject.service('storage-manager'),

  playingTrip: false,
    tripIndex: 0,
    tripCount: 0,

    shouldResetWatcher: false,

    lastUpdateTime: null,

    data: { //Any data can go here
      SOH: 0,
      GIDs: 256,
      batteryTemp: 0,
      tempOffset: 100,
      isCharging: false,
      batteryVolts: 0,
      headLights: false,
      fogLights: false,
      turnSignal: "Off",
      odometer: 0,
      distanceUnits: "M",

      distanceTraveled: 0,
      rawDistanceTraveled: null,
      calculatedDistanceTraveled: null,
      distancePerKW: 0,
      wattsPerDistance: 0,
      transmission: "T",

      speed: 0,
      averageSpeed: 0,
      speedLog: [],

      turnAngle: 0,

      watts: 0,
      kilowatts: 0,

      wattsUsed: 0,
      wattsStarted: 0,
      wattsStartedTime: null,
      wattsStartedCharging: null,

      regenWatts: 0,
      availableRegen: 0,
      targetRegenBraking: null,
      targetRegen: null,

      motorWatts: 0,
      rawMotorAmps: null,
      rawMotorVolts: null,
      averageMotorWatts: null,
      peakMotorWatts: 0,
      averageMotorAmps: null,
      averageMotorVolts: null,

      climateOn: false,
      ventMode: "waiting...",
      fanSpeed: 0,

      outsideTemp: null,
      climateSetPoint: 0,
      insideTemp: null,

      climateConsumption: 0,
      ACUsage: null,
      alternateClimateUsage: null,
      averageClimateUsage: null,

      actualSOC: 100,
      hx: 100,
      SOCDifference: 0,
      capacityAH: 0,

      accVolts: 0,

      wattsPerSOC: 170,

      tire1: 0,
      tire2: 0,
      tire3: 0,
      tire4: 0,
      tireDelta: 0,

      chargingVolts: 0,
      chargingAmps: 0,
      chargingWatts: 0,

      cellVoltages: [],
      cellVoltDelta: 0,
      cellTemps: [],
      cellTempDelta: 0,
      cellShunts: "",

      parkingBrakeOn: false,

      cruiseControlOn: null,

      isBuckled: false,
      ODOUnits: "M",

      distanceOffset: 0,
      stoppedCount: 0,
      carIsOff: false,

      startTime: new Date().getTime(),
      endTime: null
    },

    /*set() {
      this._super();
      },*/

    availableData: function availableData(typeOverride) {
      var isValid = function isValid(val) {
        if (typeof typeOverride == 'string') {
          return typeof val === 'undefined';
        } else {
          return typeof val !== 'array' && typeof val === 'undefined' && typeof val !== 'object' && typeof val !== 'function' && val !== null && val !== "";
        }
      },
          availableKeys = [];

      var keys = Object.getOwnPropertyNames(this.data);
      //console.log("Checking available data", keys, this);

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (!key.match(/\_|play|last|watch/i) && isValid(this.data[key])) availableKeys.push(key);
        //console.log(index);
        if (i === keys.length - 1) {
          console.log("Got available keys", availableKeys);
          return availableKeys;
        }
      }
    },

    getTrip: function getTrip() {
      //console.log("Getting trip", tripStore);
      return tripStore;
    },


    historyCreated: function historyCreated() {
      //clear any averages
      this.set('data.startTime', new Date().getTime());
      this.set('data.endTime', null);
      this.set('data.startWatts', this.data.watts);
      this.set('data.averageClimateUsage', 0);
      this.set('data.averageMotorAmps', 0);
      this.set('data.averageRegenWatts', 0);
      this.set('data.averageMotorVolts', 0);
      this.set('data.peakMotorWatts', 0);
      this.set('data.stoppedCount', 0);
      //this.dataSinceHistory = {};
      averageLogs = {};
    },

    reset: function reset() {

      this.set('data.wattsStartedTime', new Date().getTime());
      this.set('data.distanceTraveled', 0);
      this.set('data.distancePerKW', 0);
      this.set('dataSinceHistory', {});
      this.set('properties', 0);
      this.get('logManager').resetHistoryName();
      this.set('history.currentTripStart', this.getCurrentDataManager());
    },

    getCurrentDataManager: function getCurrentDataManager() {

      var currentDataManager = {};
      Object.getOwnPropertyNames(this.data).forEach((key) => {
        if (typeof this.data[key] !== 'function') {
          currentDataManager[key] = this.data[key];
        } else {
          //console.log(key + " Is a function");
        }
      });
      return currentDataManager;
      //console.log("Generated current DataManager ", currentDataManager, Object.getOwnPropertyNames(this.data));
      //return Ember.copy(this.data);
    },


    loadTrip: function loadTrip(tripData, isPlaying) {
      tripStore = tripData;
      if (typeof isPlaying === 'undefined') {
        isPlaying = true;
      }
      this.set('playingTrip', isPlaying);

      this.set('data', tripData[0]);

      this.set('tripCount', Object.keys(tripData).length);
      console.log("Loading Trip length ", this.get('tripCount'));
      if (!isPlaying) {
        this.setTripIndex(this.get('tripCount'));
      } else {
        this.setTripIndex(0);
      }
    },

    stopPlaying: function stopPlaying() {

      this.set('playingTrip', false);
      tripStore = {};
      this.get('logManager').getLog(this.get('logManager').historyLogName, (data) => {
        console.log("Found trip from today ", data);
        this.loadTrip(data, false);
      });
    },
    setTripIndex: function setTripIndex(index) {
      if (!index) index = 0;
      this.set('tripIndex', index);
      var tripKeys = Object.keys(tripStore);
      var firstKey = tripKeys[index];
      var oldTripStart = this.data.wattsStartedTime;
      this.set('data', tripStore[firstKey]);
      this.updatedProperties();
      if (this.get('data.wattsStartedTime') !== oldTripStart) {
        var newTripStart = null;

        for (var i = 0; i < tripKeys.length; i++) {
          if (tripKeys[i] >= oldTripStart) {
            newTripStart = tripStore[tripKeys[i]];
            break;
          }
        }
        this.set('history.currentTripStart', newTripStart);
      }
    },

    observeIndex: function () {
      if (this.playingTrip) {
        var lastIndex = this.get('tripIndex');
        //console.log(this.get('tripIndex'));
        Ember.run.later( () => {
          if (this.get('tripIndex') == lastIndex) {
            this.setTripIndex(lastIndex);
          }
        }, 30);
      }
      //this.setTripIndex(this.get('tripIndex'));
    }.observes('tripIndex'),

    callSubscriptions: function callSubscriptions() {
      //console.log("Calling functions for updates.");
    },


    properties: 100,
    updatedProperties: function updatedProperties() {
      if (this.properties < Object.keys(this.data).length / 2) {
        this.set('properties', this.properties + 1);
      } else {
        this.set('properties', 0);
        var now = new Date().getTime();

        if (!this.playingTrip) {
          if (this.get('shouldResetWatcher')) {
            this.set('shouldResetWatcher', false);
            this.resetWatcher();
          }
          var currentDataManager = this.getCurrentDataManager();
          this.set('history.lastState', currentDataManager);
          //let history = this.get('history.content');
          //this.set('history', history);

          tripStore[now] = currentDataManager;
          var tripLength = Object.keys(tripStore).length;
          console.log("Trip length ", tripLength, this.get('history'));
          this.set('tripIndex', tripLength);
          this.historyCreated();
          if (tripLength % 5 == 0) {
            this.get('logManager').saveHistory();
          }

          if (tripLength % 13 == 0) {
            this.get('logManager').saveLog();
          }
        } else {
          console.log("Not saving history because playing trip");
        }
        this.set('data.startTime', now);
      }
    },


    getAverage: function getAverage(key, value) {
      if (!averageLogs[key]) averageLogs[key] = [];
      averageLogs[key].push(value);
      var averageSum = 0;
      averageLogs[key].forEach(function (averagePoint) {
        averageSum = averageSum + averagePoint;
      });
      return averageSum / averageLogs[key].length;
    },

    dataSinceHistory: {},
    hasDataFor: function hasDataFor(key) {
      if (this.dataSinceHistory.hasOwnProperty(key)) {
        return true;
      } else {
        return false;
      }
    },

    gotDataFor: function gotDataFor(key, value) {
      this.set('dataSinceHistory.' + key, value);
    },

    setheadLights: function setheadLights(splitMsg) {
      //expects array of two length strings
      var byte = splitMsg[1];
      console.log("Parsing byte: " + byte);
      if (byte == "00") {
        this.set('data.headLights', false);
        this.set('data.fogLights', false);
      } else if (byte == "60") {
        this.set('data.headLights', true);
        this.set('data.fogLights', false);
      } else if (byte == "68") {
        this.set('data.headLights', true);
        this.set('data.fogLights', true);
      }
      this.callSubscriptions();
    },

    setTurnSignal: function setTurnSignal(splitMsg) {
      //expects array of two length strings
      var byte = splitMsg[1];
      if (byte == "06") {
        this.set('data.turnSignal', "Off");
      } else if (byte == "26") {
        this.set('data.turnSignal', "left");
      } else if (byte == "46") {
        this.set('data.turnSignal', "right");
      }
      this.callSubscriptions();
    },

    setSOH: function setSOH(splitMsg) {
      if (splitMsg.length !== 8) {
        this.get('logManager').log("SOH Message length invalid " + splitMsg.length);
        return;
      } else {
        var previousGIDs = this.data.GIDs;
        var tempByte = splitMsg[0];
        var previousBatteryTemp = this.data.batteryTemp;
        var batteryTempC = parseInt(tempByte, 16) * .25;
        var batteryTempF = batteryTempC * 9 / 5 + 32;

        var SOHbyte = splitMsg[1];
        var lastSOH = this.data.SOH;
        this.set('data.SOH', parseInt(SOHbyte, 16) / 2);
        var GIDByte = splitMsg[5];
        this.set('data.GIDs', parseInt(GIDByte, 16));

        //this.tempOffset = Math.abs(((batteryTempF / 70 * 100) / 4));
        var tempDifference = 70 - batteryTempF;
        if (tempDifference > 0) {
          tempDifference = tempDifference / 4;
        } else {
          tempDifference = tempDifference / 8;
        }
        this.set('data.tempOffset', 100 - tempDifference);

        if (!this.data.actualSOC) {
          return;
        }

        var wattsFromGIDs = Math.abs(this.data.GIDs * 0.775 * this.data.tempOffset);
        var kWFromGIDs = wattsFromGIDs / 1000;

        //Essentially calculate Kw from SOC and make sure it roughly aligns with GIDs. If it doesn't, likley over 255..
        if (this.data.actualSOC && this.hasDataFor('actualSOC')) {
          var kWFromSOC = Math.round(this.data.actualSOC * 170 / 1000);

          if (kWFromSOC > kWFromGIDs + 3 && this.data.GIDs < 200) {
            this.set('data.GIDs', this.data.GIDs + 255);
            wattsFromGIDs = this.data.GIDs * 0.775 * this.data.tempOffset;
            kWFromGIDs = wattsFromGIDs / 1000;
          }
          GIDsConfirmed = true;
        }
        this.get('logManager').log("GIDs: " + this.data.GIDs + " Temp: " + batteryTempF + " offset = " + this.data.tempOffset + " GID watts " + wattsFromGIDs);

        if (this.get('settings.settings.experience.tempUnits') == "F") {
          this.set('data.batteryTemp', batteryTempF); //convert to F
        } else {
          this.set('data.batteryTemp', batteryTempC);
        }

        /*if(batteryTempC > 46) {
          $rootScope.$broadcast('notification', {
            title: $translate.instant("NOTIFICATIONS.HIGH_BAT_TEMP.TITLE"),
            time: (new Date()).getTime(),
            seen: false,
            content: $translate.instant("NOTIFICATIONS.HIGH_BAT_TEMP.CONTENT", {temp: this.batteryTemp}),
            icon: "whatshot"
          });
        }
         if(batteryTempC < 0) {
          $rootScope.$broadcast('notification', {
            title: $translate.instant("NOTIFICATIONS.LOW_BAT_TEMP.TITLE"),
            time: (new Date()).getTime(),
            seen: false,
            content: $translate.instant("NOTIFICATIONS.LOW_BAT_TEMP.CONTENT", {temp: this.batteryTemp}),
            icon: "ac_unit"
          });
        }
         if(lastSOH != this.SOH && lastSOH != 0 && this.SOH != 0) {
          $rootScope.$broadcast('notification', {
            title: $translate.instant("NOTIFICATIONS.SOH_CHANGE.TITLE"),
            time: (new Date()).getTime(),
            seen: false,
            content: $translate.instant("NOTIFICATIONS.SOH_CHANGE.CONTENT", {lastSOH: lastSOH, SOH: this.SOH, odometer: this.odometer}),
            icon: "battery_alert"
          });
        }
         if(this.isCharging && this.batteryTemp > previousBatteryTemp + 1 && (previousBatteryTemp > 2 || previousBatteryTemp < 2) && this.hasDataFor('batteryTemp')) {
          $rootScope.$broadcast('notification', {
            title: $translate.instant("NOTIFICATIONS.RAPID_TEMP.TITLE"),
            time: (new Date()).getTime(),
            seen: false,
            content: $translate.instant("NOTIFICATIONS.RAPID_TEMP.CONTENT", {temp: this.batteryTemp, increase: this.batteryTemp - previousBatteryTemp}),
            icon: "whatshot"
          });
        }
        /*
         Calculate the kwh remaining in the battery
          Need to usitilize this calculation when temperature is obtained
          (((281 - 6 Unusable) * 80) * .9705 energy recovery factor) * 0% temp correction = 21.351kWh usable
         */
        if (previousGIDs != this.data.GIDs || wattsFromGIDs > this.data.watts + 77.5 || wattsFromGIDs < this.data.watts - 77.5) {
          this.set('data.wattDifference', wattsFromGIDs - this.data.watts);
          this.set('data.watts', wattsFromGIDs);
          this.set('data.kilowatts', kWFromGIDs);
          this.getWattsPerSOC();
        } else if (previousGIDs != this.data.GIDs && this.hasDataFor('actualSOC')) {
          this.getWattsPerSOC();
        }

        if (this.data.wattsStarted == 0 || !this.data.wattsStartedTime || this.data.wattsStartedTime < this.data.startTime - 1000 * 60 * 60 * 8 && this.hasDataFor('actualSOC') && this.hasDataFor('GIDs')) {
          this.setWattsWatcher();
        } else {
          this.set('data.wattsUsed', this.data.wattsStarted - this.data.watts);
        }
        this.callSubscriptions();
        this.gotDataFor('SOH', this.data.SOH);
        this.gotDataFor('GIDs', this.data.GIDs);
        this.gotDataFor('batteryTemp', this.data.batteryTemp);
      }
    },

    setWattsWatcher: function setWattsWatcher() {
      this.set('shouldResetWatcher', true);
      //$localStorage.currentTripStart = null;
    }, //reset watt tracker

    resetWatcher: function resetWatcher() {
      this.set('data.wattsStarted', this.data.watts);
      this.set('data.wattsStartedTime', this.data.startTime);
      this.set('data.wattsStartedCharging', this.data.isCharging);
      this.set('data.wattsStartedODO', this.data.odometer);
      this.set('data.wattsUsed', 0);
      this.set('data.distanceTraveled', 0);
      this.set('history.currentTripStart', this.getCurrentDataManager());
    },

    set12vBattery: function set12vBattery(splitMsg) {
      this.set('data.accBattVolts', parseInt(splitMsg[3], 16) / 10);
      this.callSubscriptions();
      /*
         if(this.accBattVolts < 11 && this.accBattVolts > 5) {
           $rootScope.$broadcast('notification', {
             title: $translate.instant("NOTIFICATIONS.LOW_12V.TITLE"),
             time: (new Date()).getTime(),
             seen: false,
             content: $translate.instant("NOTIFICATIONS.LOW_12V.CONTENT", {volts: this.accBattVolts}),
             icon: "battery_20"
           });
         }*/
    },

    setOdometer: function setOdometer(splitMsg) {
      if (splitMsg.length !== 8) {
        this.get('logManager').log("Odometer message invalid length " + splitMsg.length);
        return;
      }
      var ODObyte = splitMsg[1] + splitMsg[2] + splitMsg[3];
      var rawUnits = splitMsg[7];
      if (rawUnits == "40" || this.get('settings.settings.experience').distanceUnits == "K") {
        this.set('data.distanceUnits', "K");
      }
      var lastODO = this.data.odometer;

      var newODO = parseInt(ODObyte, 16);
      if (newODO != lastODO) {
        this.set('data.odometer', newODO);
      }

      if (this.data.distanceUnits != this.data.ODOUnits && this.data.distanceUnits != null && this.data.ODOUnits !== null || this.get('settings.settings.experience').distanceUnits != this.data.ODOUnits) {
        if (this.data.ODOUnits == "M" && (this.data.distanceUnits == "K" || this.get('settings.settings.experience').distanceUnits == "K")) {
          this.set('data.odometer', this.data.odometer * 1.60934);
        }
        if (this.data.ODOUnits == "K" && (this.data.distanceUnits == "M" || this.get('settings.settings.experience').distanceUnits == "M")) {
          this.set('data.odometer', this.data.odometer * 0.621371);
        }
      }

      /*if(lastODO < this.odometer && this.distanceWatcher) { //if the rawDistanceTraveled is more than the watcher, it must have reset
        this.distancePerMile = this.rawDistanceTraveled - this.distanceWatcher;
      }*/

      if (lastODO < this.data.odometer && lastODO != 0) {
        this.set('history.milesDriven', this.get('history.milesDriven') + 1);
        this.set('history.milesDrivenToday', this.get('history.milesDrivenToday') + 1);
        if (this.get('history.currentTripStart') !== null && this.get('history.currentTripStart.odometer')) {
          var odoAtBeginning = this.get('history.currentTripStart.odometer') - this.get('history.currentTripStart.distanceOffset');
          this.set('data.distanceTraveled', this.data.odometer - odoAtBeginning);
        } else {
          this.set('data.distanceTraveled', this.data.distanceTraveled + (this.data.odometer - lastODO) + this.data.distanceOffset);
        }

        this.set('data.lastODOTime', new Date().getTime());
      }
      this.gotDataFor('odometer', this.data.odometer);
      //this.callSubscriptions();
    },

    setSpeed: function setSpeed(splitMsg) {
      if (splitMsg.length < 7) {
        this.get('logManager').log("Speed message invalid length");
        return;
      }
      var rawSpeed = parseInt(splitMsg[0] + splitMsg[1], 16);
      var units = splitMsg[4];
      var KMH = rawSpeed / 100;
      var ODOUnits = splitMsg[6];
      if (ODOUnits == "60") {
        this.set('data.ODOUnits', "M");
      } else if (ODOUnits == "40") {
        this.set('data.ODOUnits', "K");
      }
      if (units == "00" && this.get('settings.settings.experience').distanceUnits == "K") {
        this.set('data.speed', KMH + "kmh");
        this.get('logManager').log("Vehicle set to Kilometers");
        this.set('data.distanceUnits', "K");
        if (!this.get('settings.settings.experience').distanceUnits) {
          this.get('settings.settings.experience').distanceUnits = "K";
        }
        if (!this.get('settings.settings.experience').tempUnits) {
          this.get('settings.settings.experience').tempUnits = "C";
        }
      }
      if (units == "20" && this.get('settings.settings.experience').distanceUnits == "M") {
        this.set('data.speed', parseInt(KMH * 0.621371) + "mph"); //kmh to mp)h
        this.set('data.distanceUnits', "M");
        if (!this.get('settings.settings.experience').distanceUnits) {
          this.get('settings.settings.experience').distanceUnits = "M";
        }
        if (!this.get('settings.settings.experience').tempUnits) {
          this.get('settings.settings.experience').tempUnits = "F";
        }
        //console.log("Vehicle set to Miles")
      }

      var now = new Date().getTime();
      if (this.data.lastSpeedTime && this.gotDataFor('speed') && this.gotDataFor('odometer') && parseInt(this.data.speed) > 0) {
        var timeDifference = now - this.data.lastSpeedTime;
        var distanceSinceLastSpeed = parseInt(this.data.speed) / (1000 * 60 * 60 / timeDifference);
        if (distanceSinceLastSpeed < 1) {
          this.set('data.distanceTraveled', this.get('data.distanceTraveled') + distanceSinceLastSpeed);
          this.set('data.distanceOffset', this.data.distanceTraveled % 1);
        }
      }

      this.set('data.lastSpeedTime', now);

      this.set('data.averageSpeed', this.getAverage('speed', parseInt(this.data.speed)));

      this.callSubscriptions();
      this.gotDataFor('speed', this.data.speed);
    },

    setWheelSpeed: function setWheelSpeed(splitMsg) {
      var speed = parseInt(splitMsg[4] + splitMsg[5], 16) * 0.0245; //
      this.set('data.wheelSpeedRight', parseInt(splitMsg[0] + splitMsg[1], 16) * 0.0118); //*0.0118
      this.set('data.wheelSpeedLeft', parseInt(splitMsg[2] + splitMsg[3], 16) * 0.0118); // *0.0118

      if (this.get('settings.settings.experience').distanceUnits == "K") {
        this.set('data.altSpeed', speed + "kmh");
        this.get('logManager').log("Vehicle set to Kilometers");
      }
      if (this.get('settings.settings.experience').distanceUnits == "M") {
        this.set('data.altSpeed', parseInt(speed * 0.621371) + "mph"); //kmh to mph

      }
    },


    setTransmission: function setTransmission(splitMsg) {
      var transmissionByte = splitMsg[0];
      this.get('logManager').log("Transmission byte: " + transmissionByte);
      if (transmissionByte == "08" || transmissionByte == "00") {
        this.set('data.transmission', "P");
      } else if (transmissionByte == "18") {
        this.set('data.transmission', "N");
      } else if (transmissionByte == "20") {
        this.set('data.transmission', "D");
      } else if (transmissionByte == "10") {
        this.set('data.transmission', "R");
      } else if (transmissionByte == "38") {
        //if(this.distanceUnits == "M" || this.ODOUnits == "M"){ //TODO: IDENTIFY NEWER VEHICLES WITH "B" MODE, LEARN HOW TO DETECT THEIR E MODE
        this.set('data.transmission', "E");
        /*} else {
          this.set('data.transmission', "B");
        }*/
      } else {
        this.set('data.transmission', transmissionByte + "?");
      }
      this.callSubscriptions();
      this.gotDataFor('transmission', this.data.transmission);
      if (this.data.transmission !== "P") {
        this.set('data.isCharging', false);
      }
    },

    setChargeStatus: function setChargeStatus(splitMsg) {
      var chargeByte = splitMsg[0];
      var currentCharging = this.data.isCharging;
      if (chargeByte == "FF") {
        this.set('data.isCharging', true);
      } else {
        this.set('data.isCharging', false);
      }
      if (this.data.isCharging != currentCharging || this.data.isCharging !== this.data.wattsStartedCharging || this.data.startTime > this.data.wattsStartedCharging + 16000 && parseInt(this.data.speed) != 0) {
        //$rootScope.$broadcast('changeCharging');
        setTimeout( () => {
          if (this.data.isCharging !== currentCharging) {
            this.setWattsWatcher();
          }
        }, 15000);
      }
    },

    setCruiseControl: function setCruiseControl(splitMsg) {
      var chargeByte = splitMsg[4];

      if (chargeByte == "80") {
        this.set('data.cruiseControlOn', true);
      } else {
        this.set('data.cruiseControlOn', false);
      }
    },

    setSeatBelts: function setSeatBelts(splitMsg) {
      var beltByte = splitMsg[0];

      if (beltByte == "03") {
        this.set('data.isBuckled', false);
      } else if (beltByte == "01") {
        this.set('data.isBuckled', true);
      }
    },

    setParkingBrake: function setParkingBrake(splitMsg) {
      var PBOn = splitMsg[0];
      if (PBOn == "16") {
        this.set('data.parkingBrakeOn', true);
      } else {
        this.set('data.parkingBrakeOn', false);
      }
    },

    setTurnDegrees: function setTurnDegrees(splitMsg) {
      var degreesHex = splitMsg[0] + splitMsg[1];
      this.set('data.turnAngle', parseInt(degreesHex, 16) / 10);
      //this.callSubscriptions();
    },

    setTirePressures: function setTirePressures(splitMsg) {
      if (splitMsg.length < 7) {
        this.get('logManager').log("Tire message invalid length");
        return;
      }
      var tire1 = parseInt(splitMsg[2], 16) / 4;
      var tire2 = parseInt(splitMsg[3], 16) / 4;
      var tire3 = parseInt(splitMsg[4], 16) / 4;
      var tire4 = parseInt(splitMsg[5], 16) / 4;
      if (tire1 != 0) {
        this.set('data.tire1', tire1);
      }
      if (tire2 != 0) {
        this.set('data.tire2', tire2);
      }
      if (tire3 != 0) {
        this.set('data.tire3', tire3);
      }
      if (tire4 != 0) {
        this.set('data.tire4', tire4);
      }

      this.set('data.tireHighest', Math.max(this.data.tire1, this.data.tire2, this.data.tire3, this.data.tire4));
      this.set('data.tireLowest', Math.min(this.data.tire1, this.data.tire2, this.data.tire3, this.data.tire4));
      this.set('data.tireDelta', Math.abs(this.data.tireHighest - this.data.tireLowest));
      /*
         if(this.tireDelta >= $localStorage.settings.notifications.tireDeltaThreshold) {
           $rootScope.$broadcast('notification', {
             title: $translate.instant('NOTIFICATIONS.TIRE_DELTA.TITLE', {tire: this.tireDelta}),
             time: (new Date()).getTime(),
             seen: false,
             content: $translate.instant('NOTIFICATIONS.TIRE_DELTA.CONTENT', {value: this.tireDelta, threshold: $localStorage.settings.notifications.tireDeltaThreshold}),
             icon: "swap_vert"
           });
         }
      
         var alertLowTire = function(tire, value) {
           $rootScope.$broadcast('notification', {
             title: $translate.instant('NOTIFICATIONS.LOW_TIRE.TITLE', {tire: tire}),
             time: (new Date()).getTime(),
             seen: false,
             content: $translate.instant('NOTIFICATIONS.LOW_TIRE.CONTENT', {tire: tire, value: value, threshold: $localStorage.settings.notifications.tireLowThreshold}),
             icon: "panorama_horizontal"
           });
         }
         var alertHighTire = function(tire, value) {
           $rootScope.$broadcast('notification', {
             title: $translate.instant('NOTIFICATIONS.HIGH_TIRE.TITLE', {tire: tire}),
             time: (new Date()).getTime(),
             seen: false,
             content: $translate.instant('NOTIFICATIONS.HIGH_TIRE.CONTENT', {tire: tire, value: value, threshold: $localStorage.settings.notifications.tireHighThreshold}),
             icon: "panorama_wide_angle"
           });
         }
      
         if(this.tire1 < $localStorage.settings.notifications.tireLowThreshold && this.tire1 > 5) {
           alertLowTire($translate.instant('NOTIFICATIONS.TIRES.R_FRONT'), this.tire1);
         } else if(this.tire1 > $localStorage.settings.notifications.tireHighThreshold) {
           alertHighTire($translate.instant('NOTIFICATIONS.TIRES.R_FRONT'), this.tire1)
         }
         if(this.tire2 < $localStorage.settings.notifications.tireLowThreshold && this.tire2 > 5) {
           alertLowTire($translate.instant('NOTIFICATIONS.TIRES.L_FRONT'), this.tire2);
         } else if(this.tire2 > $localStorage.settings.notifications.tireHighThreshold) {
           alertHighTire($translate.instant('NOTIFICATIONS.TIRES.L_FRONT'), this.tire2)
         }
      
         if(this.tire3 < $localStorage.settings.notifications.tireLowThreshold && this.tire3 > 5) {
           alertLowTire($translate.instant('NOTIFICATIONS.TIRES.R_REAR'), this.tire3);
         } else if(this.tire3 > $localStorage.settings.notifications.tireHighThreshold) {
           alertHighTire($translate.instant('NOTIFICATIONS.TIRES.R_REAR'), this.tire3)
         }
      
         if(this.tire4 < $localStorage.settings.notifications.tireLowThreshold && this.tire4 > 5) {
           alertLowTire($translate.instant('NOTIFICATIONS.TIRES.L_REAR'), this.tire4);
         } else if(this.tire4 > $localStorage.settings.notifications.tireHighThreshold) {
           alertHighTire($translate.instant('NOTIFICATIONS.TIRES.L_REAR'), this.tire4)
         }
      */
      this.gotDataFor('tires', this.data.tire1);
      this.callSubscriptions();
    },

    setClimateOff: function () {
      this.set('data.climateConsumption', 0);
      this.set('data.motorWatts', 0);
      this.set('data.climateOn', false);
    }.observes('data.carIsOff'),

    setClimateDataA: function setClimateDataA(splitMsg) {
      this.set('data.climateSetPoint', parseInt(splitMsg[4], 16));
      var outside = parseInt(splitMsg[7], 16) - 41;
      if (outside > -40) {
        this.set('data.outsideTemp', outside);
      }
      //this.callSubscriptions();
      if (this.get('settings.settings.experience').tempUnits == "C" && this.get('data.distanceUnits') == "M") {
        this.set('data.outsideTemp', (this.data.outsideTemp - 32) * 5 / 9);
        this.set('data.insideTemp', (this.data.insideTemp - 32) * 5 / 9);
      }
    },

    setClimateDataB: function setClimateDataB(splitMsg) {
      var CCOn = splitMsg[0];
      if (CCOn == "01") {
        this.set('data.climateOn', false);
      } else if (CCOn == "00") {
        this.set('data.climateOn', true);
      }

      var ventMode = splitMsg[2];
      if (ventMode == "88") {
        this.set('data.ventMode', "Face");
      } else if (ventMode == "90") {
        this.set('data.ventMode', "Face/Feet");
      } else if (ventMode == "98") {
        this.set('data.ventMode', "Feet");
      } else if (ventMode == "A0") {
        this.set('data.ventMode', "Feet/Def");
      } else if (ventMode == "A8") {
        this.set('data.ventMode', "Def");
      } else if (ventMode == "80") {
        this.set('data.ventMode', "Off");
      }

      this.set('data.fanSpeed', (parseInt(splitMsg[4], 16) - 4) / 8);
      //this.callSubscriptions();
    },

    setClimateConsumption: function setClimateConsumption(splitMsg) {
      if (splitMsg.length !== 8) {
        this.get('logManager').log("Climate message invalid length");
        return;
      }
      var oldConsumption = this.data.climateConsumption;
      var consumption = parseInt(splitMsg[3], 16).toString(2);
      //consumption = consumption.substring(4, consumption.length);
      var totalConsumption = 0;
      for (var i = 0; i < consumption.length; i++) {
        totalConsumption = totalConsumption + parseInt(consumption.charAt(i));
      }
      this.get('logManager').log("Climate Usage LSB: " + totalConsumption);
      this.set('data.climateConsumption', totalConsumption * .25 * 1000);
      var outsideRaw = parseInt(splitMsg[7], 16);
      //this.outsideTemp = parseInt(outsideRaw, 16) - 56;

      //if(oldConsumption != this.climateConsumption){
      //this.callSubscriptions();
      //$rootScope.$broadcast('dataUpdate:Climate', this);
      if (this.data.alternateClimateUsageclimateConsumption !== 0) {
        this.set('data.averageClimateUsage', this.getAverage('climateConsumption', this.data.climateConsumption));
      }
      this.gotDataFor('climateConsumption', this.data.climateConsumption);
      //}
    },

    parseLBCData: function parseLBCData(splitMsg) {
      var group = parseInt(splitMsg[0], 16);
      if (splitMsg.length !== 8) {
        this.get('logManager').log("Cannot parse 7BB, invalid length: " + splitMsg.length);
        return;
      }
      if (splitMsg[0] == "24") {
        this.set('data.hx', parseInt(splitMsg[2] + splitMsg[3], 16) / 100);
        /*if(this.hx < 50 && this.hx !== 0) {
          $rootScope.$broadcast('notification', {
            title: $translate.instant("NOTIFICATIONS.LOW_HX.TITLE"),
            time: (new Date()).getTime(),
            seen: false,
            content: $translate.instant("NOTIFICATIONS.LOW_HX.CONTENT", {hx: this.hx}),
            icon: "battery_alert"
          });
        }*/
        var fullSOC = parseInt(splitMsg[5] + splitMsg[6] + splitMsg[7], 16);
        //console.log("OMG GOT FULL SOC " + fullSOC);
        var previousSOC = this.data.actualSOC;
        if (fullSOC / 10000 <= 100) {
          this.set('data.actualSOC', fullSOC / 10000);
          this.get('logManager').log("Got battery SOC: " + this.data.actualSOC);
        }
        if (this.data.capacityAH) {
          this.set('data.usableCapacity', this.data.actualSOC / 100 * this.data.capacityAH);
        }
        /*if(this.actualSOC < 20) {
          $rootScope.$broadcast('notification', {
            title: $translate.instant("NOTIFICATIONS.LOW_TRACTION.TITLE"),
            time: (new Date()).getTime(),
            seen: false,
            content: $translate.instant("NOTIFICATIONS.LOW_TRACTION.CONTENT", {SOC: this.SOC}),
            icon: "battery_20"
          });
        }*/
        if (this.data.wattsPerSOC && GIDsConfirmed || this.get('history.lastState.wattsPerSOC')) {
          this.set('data.wattDifference', (this.data.actualSOC - previousSOC) * this.data.wattsPerSOC);
          this.set('data.watts', this.data.watts + this.data.wattDifference);
          this.set('data.kilowatts', this.data.watts / 1000);
          this.set('data.wattsUsed', this.data.wattsStarted - this.data.watts);
          if (this.data.wattsUsed < -800 && parseInt(this.data.speed) == 0) {
            //TODO: Don't do this
            this.set('data.isCharging', true);
          }
          //this.getWattsPerMinute();
        }
        //this.getDistancePerWatt();

        if (this.data.actualSOC > previousSOC + 15 && !this.data.isCharging) {
          this.setWattsWatcher();
        }

        //$rootScope.$broadcast('dataUpdate:SOC', this);
        this.gotDataFor('actualSOC', this.data.actualSOC);
      } else if (splitMsg[0] == "25") {
        var AH = parseInt(splitMsg[2] + splitMsg[3] + splitMsg[4], 16);
        var unknown = parseInt(splitMsg[5] + splitMsg[6], 16);

        console.log("Got unknown data next to AH ", unknown);
        this.set('data.chargeMystery4', unknown);
        this.set('data.capacityAH', AH / 10000);
      } else if (splitMsg[0] == "23") {
        var VCC = parseInt(splitMsg[3] + splitMsg[4], 16);
        this.set('data.accVolts', VCC / 1024);
        this.gotDataFor('accVolts', this.data.accVolts);
        this.set('data.batteryVolts', parseInt(splitMsg[1] + splitMsg[2], 16) / 100);
        if (this.get('data.batteryAmps')) {
          this.set('data.batteryWatts', this.data.batteryAmps * this.data.batteryVolts);
          this.set('data.averageBatteryWatts', this.getAverage('batteryWatts', this.data.batteryAmps * this.data.batteryVolts));
        }
        var unknown = parseInt(splitMsg[5] + splitMsg[6], 16);
        console.log("Got unknown next to battery volts ", unknown);
        this.set('data.chargeMystery3', unknown);
        this.get('logManager').log("Got battery volts: " + this.data.batteryVolts);
        /*if(this.accVolts < 11 && this.accVolts > 6) {
          $rootScope.$broadcast('notification', {
            title: $translate.instant("NOTIFICATIONS.LOW_12V.TITLE"),
            time: (new Date()).getTime(),
            seen: false,
            content: $translate.instant("NOTIFICATIONS.LOW_12V.CONTENT", {volts: this.accVolts}),
            icon: "battery_20"
          });
        }*/
      } else if (splitMsg[0] == "22") {

        var third = parseInt(splitMsg[3], 16); //
        var _fourth = parseInt(splitMsg[4], 16); //
        var thirdCombind = parseInt(splitMsg[3] + splitMsg[4], 16);

        var fith = parseInt(splitMsg[5], 16); //22 then 86
        var sixth = parseInt(splitMsg[6], 16); //0
        var fithCombind = parseInt(splitMsg[5] + splitMsg[6], 16);

        this.set('data.chargeMystery1', fithCombind);
        this.set('data.chargeMystery22', thirdCombind);

        console.log("Can you identify these numbers? (3, 4, 3+4, 5, 6, 5+6)", third, _fourth, thirdCombind, fith, sixth, fithCombind);
      } else if (splitMsg[0] == "21") {
        var first = parseInt(splitMsg[1], 16); //
        var second = parseInt(splitMsg[2], 16); //
        var firstCombind = parseInt(splitMsg[1] + splitMsg[2], 16);

        var _third = parseInt(splitMsg[3], 16); //
        //let fourth = parseInt(splitMsg[4], 16); //
        var _thirdCombind = parseInt(splitMsg[3] + splitMsg[4], 16);

        var _fith = parseInt(splitMsg[5], 16); //22 then 86
        var _sixth = parseInt(splitMsg[6], 16); //0
        var _fithCombind = parseInt(splitMsg[5] + splitMsg[6], 16);
        this.set('data.chargeMystery211', first);
        this.set('data.chargeMystery2', splitMsg[4]);
        this.set('data.chargeMystery21', _fithCombind);

        if (splitMsg[4] == "FF") {
          this.set('data.batteryAmps', Math.abs((0 - 65535 + _fithCombind) / 1000));
        }if (splitMsg[4] == "FE") {
          this.set('data.batteryAmps', Math.abs((0 - 65535 * 2 + _fithCombind) / 1000));
        }if (splitMsg[4] == "FD") {
          this.set('data.batteryAmps', Math.abs((0 - 65535 * 3 + _fithCombind) / 1000));
        } else if (splitMsg[4] == "00") {
          this.set('data.batteryAmps', 0 - _fithCombind / 1000);
        } else if (splitMsg[4] == "01") {
          this.set('data.batteryAmps', 0 - (65535 + _fithCombind) / 1000);
        } else {
          console.log('Battery Amps 4th message unexpected: ' + splitMsg[4]);
        }

        console.log("Can you identify these numbers? (1, 2, 1+2, 3, 4, 3+4, 5, 6, 5+6)", first, second, firstCombind, _third, fourth, _thirdCombind, _fith, _sixth, _fithCombind);
      }
      this.callSubscriptions();
    },

    parseCellVoltage: function parseCellVoltage(response) {
      var simpleVoltages = [];
      response = response.replace(/7BB/g, '');
      //this.get('logManager').log("parsing cell voltage " + response);
      if (response.length > 17) {
        var splitResponse = response.match(/.{1,8}/g);
        for (var r = 0; r < splitResponse.length; r++) {
          var splitMsg = splitResponse[r].match(/.{1,2}/g);
          splitMsg.shift();
          for (var i = 3; i < splitMsg.length - 3; i += 2) {
            simpleVoltages.push(parseInt(splitMsg[i - 1] + splitMsg[i], 16) / 1000);
          }
        }
      } else {
        //response.substring(3, response.length - 1);
        voltageStore.push(response);
        //console.log(voltageStore.length);
        if (voltageStore.length >= 29) {
          //console.log("Got all cell voltages ", voltageStore);
          var allData = "";
          for (var r = 0; r < voltageStore.length; r++) {
            var splitMsg = voltageStore[r].match(/.{1,2}/g);
            var number = splitMsg.shift();
            //console.log(number, splitMsg);
            if (number == "10") {
              splitMsg.splice(0, 3);
            }
            //console.log(splitMsg.join(""));
            allData = allData + splitMsg.join("");
          }
          //console.log(allData);
          var allMsgs = allData.match(/.{1,2}/g);
          //console.log(allMsgs);
          for (var i = 1; i < allMsgs.length; i += 2) {
            if (simpleVoltages.length < 96) {
              simpleVoltages.push(parseInt(allMsgs[i - 1] + allMsgs[i], 16) / 1000);
            }
          }
          //console.log("Finished processing " + simpleVoltages.length + " voltages", simpleVoltages);
          this.set('data.cellVoltages', simpleVoltages);
          this.set('data.cellVoltHighest', Math.max.apply(null, this.data.cellVoltages));
          this.set('data.cellVoltLowest', Math.min.apply(null, this.data.cellVoltages));
          this.set('data.cellVoltDelta', Math.round(Math.abs(this.data.cellVoltHighest - this.data.cellVoltLowest) * 1000));

          //$rootScope.$broadcast('dataUpdate:Volts');
          /*for(var i = 0; i < 96, i++) {
            simpleVoltages.push((parseInt(splitMsg[i* 4] + splitMsg[i], 16)) / 1000);
          }*/
        }
      }

      //console.log(simpleVoltages.length, "cells", simpleVoltages);
    },

    parseCellTemp: function parseCellTemp(originalResponse) {
      var parseResponse = (response) => {
        var splitMsg = response.match(/.{1,2}/g);
        //console.log("Temp message "+response+" for ", splitMsg[0]);
        if (splitMsg[0] == "10") {
          tempStore = [];
          tempStore.push(splitMsg[4]);
          tempStore.push(splitMsg[5]);
          tempStore.push(splitMsg[6]);
          tempStore.push(splitMsg[7]);
        } else if (splitMsg[0] == "21") {
          splitMsg.shift();
          tempStore = tempStore.concat(splitMsg);
        } else if (splitMsg[0] == "22") {
          tempStore.push(splitMsg[1]);
          //console.log(tempStore);
          var mochTemps = [];
          for (var i = 2; i < tempStore.length; i += 3) {
            var cellTempRaw = parseInt(tempStore[i - 2] + tempStore[i - 1], 16);

            var cellTempC = parseInt(tempStore[i], 16);
            //console.log("Raw temp, " + cellTempRaw + " C temp = " + cellTempC );
            if (this.get('settings.settings.experience').tempUnits == "F") {
              cellTempC = cellTempC * 9 / 5 + 32; //convert to F
            }
            if (cellTempC < 250) {
              mochTemps.push(cellTempC);
            }
          }
          //console.log("New cell temps", mochTemps);
          this.set('data.cellTemps', mochTemps);
          this.set('data.cellTempHighest', Math.max.apply(null, this.data.cellTemps));
          this.set('data.cellTempLowest', Math.min.apply(null, this.data.cellTemps));
          this.set('data.cellTempDelta', Math.round(Math.abs(this.data.cellTempHighest - this.data.cellTempLowest)));

          this.callSubscriptions();
        }
      };

      originalResponse = originalResponse.replace(/7BB/g, '');
      if (originalResponse.length > 17) {
        var splitResponse = originalResponse.match(/.{1,8}/g);
        for (var i = 0; i < splitResponse.length; i++) {
          parseResponse(splitResponse[i]);
        }
      } else {
        parseResponse(originalResponse);
      }
    },

    parseCellShunt: function parseCellShunt(originalResponse) {
      var parseResponse = (response) => {
        var splitMsg = response.match(/.{1,2}/g);
        console.log("Shunt message " + response + " for ", splitMsg[0]);
        if (splitMsg[0] == "10") {
          splitMsg = splitMsg.slice(4, splitMsg.length + 1);
          tempStore = splitMsg;
        } else if (splitMsg[0] == "21") {
          splitMsg.shift();
          tempStore = tempStore.concat(splitMsg);
        } else if (splitMsg[0] == "22") {
          splitMsg.shift();
          tempStore = tempStore.concat(splitMsg);
        } else if (splitMsg[0] == "23") {
          splitMsg.shift();
          splitMsg.pop();
          tempStore = tempStore.concat(splitMsg);
          console.log(tempStore);
          var mochShunts = [];
          for (var i = 0; i < tempStore.length; i++) {
            var shunt = parseInt(tempStore[i], 16).toString(2);
            while (shunt.length < 4) {
              shunt += "0";
            }
            shunt = shunt.split("").reverse().join("");
            mochShunts += shunt;
          }

          console.log("New " + mochShunts.length + " shunts ", mochShunts);

          this.set('data.cellShunts', mochShunts);

          //$rootScope.$broadcast('dataUpdate:Shunts');
        }
      };
      originalResponse = originalResponse.replace(/7BB/g, '');
      if (originalResponse.length > 17) {
        var splitResponse = originalResponse.match(/.{1,8}/g);
        for (var i = 0; i < splitResponse.length; i++) {
          parseResponse(splitResponse[i]);
        }
      } else {
        parseResponse(originalResponse);
      }
    },

    getWattsPerSOC: function () {
      var wattsFromGIDs = this.data.GIDs * 0.775 * this.data.tempOffset;
      if (wattsFromGIDs != this.data.wattsPerSOCWatcher && this.data.GIDs > 0 && this.hasDataFor('actualSOC')) {
        var wattDifference = Math.abs(this.data.wattsPerSOCWatcher - this.data.watts); //Watt difference, should be 77.5, maybe more
        var SOCDifference = Math.abs(this.data.actualSOC - this.data.lastSOC);
        //var wattsToSOCRound = wattDifference * (1 / SOCDifference);

        //$rootScope.$broadcast('log', {log: "SOC difference = " + SOCDifference});
        this.set('data.wattsPerSOC', wattsFromGIDs / this.data.actualSOC);
        this.set('data.wattsPerSOCWatcher', this.data.watts);
        this.set('data.lastSOC', this.data.actualSOC);
        this.set('data.SOCDifference', SOCDifference);
        //this.wattsPerSOC = this.wattsPerSOC * (1 / SOCDifference);
      } else if (this.data.actualSOC != 0 && !this.data.wattsPerSOCWatcher) {
        this.set('data.wattsPerSOCWatcher', wattsFromGIDs);
        this.set('data.lastSOC', this.data.actualSOC);
      } else if (this.data.GIDs == 0 && this.data.wattsPerSOC && this.data.actualSOC) {
        //calculate based off of Watts per SOC
        this.set('data.watts', this.data.actualSOC * this.data.wattsPerSOC);
      }
    }.observes('data.actualSOC', 'data.GIDs'),

    getWattsPerMinute: function () {
      if (this.data.isCharging) {
        var now = new Date().getTime();
        var timeDifference = now - this.data.startTime;
        var wattDifference = this.data.watts - this.get('history.lastState.watts');
        var timeToMinutes = 1000 * 60 / timeDifference;
        this.set('data.wattsPerMinute', wattDifference * timeToMinutes);
      }
    }.observes('data.watts'),

    distancePerKW: function () {
      this.set('data.distancePerKW', this.get('data.distanceTraveled') / (this.get('data.wattsUsed') / 1000));
      this.set('data.wattsPerDistance', this.get('data.wattsUsed') / this.get('data.distanceTraveled'));

      var tripKeys = Object.keys(tripStore);
      var lastData = tripStore[tripKeys[tripKeys.length - 1]];
      console.log("Got last data", lastData);
      if (lastData) {
        var distanceSinceLastData = this.get('data.distanceTraveled') - lastData.distanceTraveled;
        var wattsSinceLastData = this.get('data.wattsUsed') - lastData.wattsUsed;
        this.set('data.averageDistancePerKW', this.getAverage('distancePerKW', distanceSinceLastData / (wattsSinceLastData / 1000)));
        this.set('data.averageWattsPerDistance', this.getAverage('wattsPerDistance', wattsSinceLastData / distanceSinceLastData));
      }
    }.observes('data.distanceTraveled', 'data.wattsUsed'),

    parseCarCan: function parseCarCan(splitMsg) {
      if (splitMsg.length !== 8) {
        this.get('logManager').log("EVSE message invalid length: " + splitMsg.length);
        this.set('data.isCharging', false);
        return;
      }
      var type = splitMsg[3];
      if (type == "10") {
        var amps = parseInt(splitMsg[4] + splitMsg[5], 16) / 16;
        if (amps < 150) {
          this.set('data.chargingAmps', amps);
        }
      }
      if (type == "30") {
        var volts = parseInt(splitMsg[4] + splitMsg[5], 16) / 128;
        this.set('data.chargingVolts', volts);
      }

      if (parseInt(this.data.chargingAmps) && parseInt(this.data.chargingVolts)) {
        this.set('data.chargingWatts', parseInt(this.data.chargingAmps * this.data.chargingVolts));
      } else {
        this.set('data.chargingWatts', 0);
        this.set('data.isCharging', false);
      }

      if (this.data.chargingVolts > 50 || this.data.wattsUsed < 500 && this.data.wattsPerMinute > 60 && parseInt(this.data.speed) == 0) {
        this.set('data.isCharging', true);
      } else {
        this.set('data.isCharging', false);
      }
    },

    watchCharging: function () {
      if(this.get('isPlaying')) return;
      var currentCharging = this.get('data').isCharging;

      setTimeout( () => {
        if (this.get('data').isCharging == currentCharging) {
          this.setWattsWatcher();
        }
      }, 5000);
    }.observes('data.isCharging'),

    parse79A: function parse79A(splitMsg) {
      if (splitMsg.length !== 8) {
        this.get('logManager').log("79A message invalid length: " + splitMsg.length);
        return;
      }
      var type = splitMsg[0];
      if (type == "05") {

        var first = parseInt(splitMsg[1], 16); //
        var second = parseInt(splitMsg[2], 16); //
        var firstCombind = parseInt(splitMsg[1] + splitMsg[2], 16);

        var third = parseInt(splitMsg[3], 16); //
        var fourth = parseInt(splitMsg[4], 16); //
        var thirdCombind = parseInt(splitMsg[3] + splitMsg[4], 16);

        var fith = parseInt(splitMsg[5], 16); //22 then 86
        var sixth = parseInt(splitMsg[6], 16); //0
        var fithCombind = parseInt(splitMsg[1] + splitMsg[2], 16);

        this.set('data.isCharging', false);
        this.set('data.chargingWatts', 0);

        this.set('data.chargeMystery51', firstCombind);
        this.set('data.chargeMystery511', first);
        this.set('data.chargeMystery512', second);
        this.set('data.chargeMystery52', thirdCombind);
        this.set('data.chargeMystery521', third);
        this.set('data.chargeMystery522', fourth);
        this.set('data.chargeMystery53', fithCombind);
        this.set('data.chargeMystery531', fith);
        this.set('data.chargeMystery532', sixth);

        console.log("This may be a newer car? (1, 2, 1+2, 2, 3, 2+3, ect)", first, second, firstCombind, third, fourth, thirdCombind, fith, sixth, fithCombind);
      } else if (type == "07") {
        this.get('logManager').log("Got climate Temperature");
        var outsideRaw = parseInt(splitMsg[5], 16);
        var insideRaw = parseInt(splitMsg[6], 16);
        var lastOutsideTemp = this.data.outsideTemp;
        this.set('data.outsideTemp', outsideRaw + 41);
        this.set('data.insideTemp', insideRaw + 41);

        if (this.get('settings.settings.experience').tempUnits == "C") {
          this.set('data.outsideTemp', (this.data.outsideTemp - 32) * 5 / 9);
          this.set('data.insideTemp', (this.data.insideTemp - 32) * 5 / 9);
        }
        /*if((this.get('settings.settings.experience').tempUnits == "F" && this.outsideTemp < 30) || (this.get('settings.settings.experience').tempUnits == "C" && this.outsideTemp < 1) && Math.round(lastOutsideTemp) == Math.round(this.outsideTemp)) {
          $rootScope.$broadcast('notification', {
            title: $translate.instant("NOTIFICATIONS.LOW_OUTSIDE_TEMP.TITLE"),
            time: (new Date()).getTime(),
            seen: false,
            content: $translate.instant("NOTIFICATIONS.LOW_OUTSIDE_TEMP.TITLE", {temp: this.outsideTemp}),
            icon: "ac_unit"
          });
        }*/
      } else if (type == "03") {
        this.set('data.level3ChargeCount', parseInt(splitMsg[4] + splitMsg[5], 16));
        this.get('logManager').log("Got L3 Charge Count " + this.data.level3ChargeCount);
      } else if (type == "04") {
        this.set('data.level2ChargeCount', parseInt(splitMsg[4] + splitMsg[5], 16));
        this.get('logManager').log("Got L2 Charge Count " + this.data.level2ChargeCount);
      }
    },

    setQCStatus: function setQCStatus(splitMsg) {
      this.set('data.chargingVolts', parseInt(splitMsg[3], 16));
      this.set('data.chargingAmps', parseInt(splitMsg[4], 16));
      if (this.chargingVolts > 10) {
        this.set('data.isCharging', true);
      } else {
        this.set('data.isCharging', false);
      }
      this.callSubscriptions();
    },

    setMotorAmps: function setMotorAmps(splitMsg) {
      var oldAmps = this.data.rawMotorAmps;
      this.set('data.rawMotorAmps', parseInt(splitMsg[2] + splitMsg[3], 16));
      if (this.data.rawMotorAmps > 40000) {
        this.set('data.rawMotorAmps', 0 - 65535 + this.data.rawMotorAmps);
      }
      this.data.averageMotorAmps = this.getAverage('motorAmps', this.data.rawMotorAmps);
      if (this.data.rawMotorVolts) {
        this.set('data.motorWatts', this.data.rawMotorAmps / 2 * (this.data.rawMotorVolts / 20) / 8.5);
        this.set('data.averageMotorWatts', this.getAverage('motorWatts', this.data.motorWatts));
        if (this.data.motorWatts > this.data.peakMotorWatts) this.data.peakMotorWatts = this.data.motorWatts;
      } else {
        this.set('data.motorWatts', 0);
      }
      if (oldAmps != this.data.rawMotorAmps) {
        //$rootScope.$broadcast('dataUpdate:Motor', this);
        this.callSubscriptions();
        this.gotDataFor('motorWatts', this.data.motorWatts);
      }
    },

    setMotorVolts: function setMotorVolts(splitMsg) {
      var oldVolts = this.data.rawMotorVolts;
      this.set('data.rawMotorVolts', parseInt(splitMsg[2] + splitMsg[3], 16));
      this.set('data.averageMotorVolts', this.getAverage('motorVolts', this.data.rawMotorVolts));
      if (this.data.rawMotorAmps) {
        this.set('data.motorWatts', this.data.rawMotorAmps / 2 * (this.data.rawMotorVolts / 20) / 8.5); //this shouldn't need /?
        this.set('data.averageMotorWatts', this.getAverage('motorWatts', this.data.motorWatts));
        if (this.data.motorWatts > this.data.peakMotorWatts) this.data.peakMotorWatts = this.data.motorWatts;
        if (this.data.motorWatts < 0) {
          this.set('data.averageRegenWatts', this.getAverage('regenWatts', Math.abs(this.data.motorWatts)));
        } else {
          this.set('data.motorWatts', 0);
        }
        /*if(this.motorWatts > 70000) {
          $rootScope.$broadcast('notification', {
            title: $translate.instant('NOTIFICATIONS.HIGH_OUTPUT.TITLE'),
            time: (new Date()).getTime(),
            seen: false,
            content: $translate.instant('NOTIFICATIONS.HIGH_OUTPUT.CONTENT', {watts: this.motorWatts}),
            icon: "show_chart"
          });
        }*/
      }
      if (oldVolts != this.data.rawMotorVolts) {
        this.callSubscriptions();
      }
      //console.log("Trying to numberize motoramps " + $factories('number')(this.motorAmps));
    },

    setAvailableRegen: function setAvailableRegen(splitMsg) {
      this.set('data.availableRegen', parseInt(splitMsg[1], 16));
    },

    setBraking: function setBraking(splitMsg) {
      this.set('data.targetRegenBraking', parseInt(splitMsg[0] + splitMsg[1], 16));
      this.set('data.targetRegen', parseInt(splitMsg[2] + splitMsg[3], 16));
      this.callSubscriptions();
    },

    setRegen: function setRegen(splitMsg) {
      this.set('data.regenWatts', parseInt(splitMsg[1] + splitMsg[2]) * this.data.rawMotorVolts * 0.00002875);
      this.set('data.averageRegenWatts', this.getAverage('regenWatts', this.data.regenWatts));
      this.callSubscriptions();
    },

    setACUsage: function setACUsage(splitMsg) {
      this.set('data.ACUsage', parseInt(splitMsg[2], 16) * 50);
      this.set('data.alternateClimateUsage', parseInt(splitMsg[5], 16) * 300);
    },

    setDistanceTraveled: function setDistanceTraveled(splitMsg) {
      var newDistanceTraveled = parseInt(splitMsg[6] + splitMsg[7], 16);
      if (newDistanceTraveled > this.data.rawDistanceTraveled && this.data.totalRawDistanceTraveled) {
        this.set('data.totalRawDistanceTraveled', this.data.totalRawDistanceTraveled + Math.abs(this.data.rawDistanceTraveled - newDistanceTraveled));
      } else {
        this.set('data.totalRawDistanceTraveled', newDistanceTraveled);
      }
      this.set('data.rawDistanceTraveled', newDistanceTraveled);
    },

    /*
    "ATZ", //reset
    "STSBR 2000000", //set baud rate
    "STI",//get firmware version
    "ATE0",//echo off
    "ATH1",//headers on
    "ATCAF 0", //turn auto formatting off
    "ATDP", //Ask for the protocol (should be CAN 500 kbps)
    "STFAC",
     "STFAP 5B3,7FF", //SOC data only
    "STFAP 292,7FF", //friction braking
    "STFAP 1CA,7FF", //friction braking, not for MY2013
    "STFAP 1CB,7FF", //target regen braking, target braking
    "STFAP 1D5,7FF" //applied regen braking
    //["at h1", "at d1", "at sh 79b", "at fc sh 79b", "at fc sd 30 00 20", "at fc sm 1", "21 02"]
    //["ATZ", "STSBR 2000000", "STI", "ATE0", "ATH1", "ATCAF 0", "ATDP", "STFAC", "STFAP 5B3,7FF"]
    //"ATD1", "ATSH79b", "ATFCSH79b", //Request for something
    */
    lastParsed: "",
    knownMessages: function knownMessages() {
      return ["79A", "763", "765", "7BB", "79A", "5B3", "55B", "54A", "260", "280", "284", "292", "1CA", "1DA", "1D4", "355", "002", "551", "5C5", "60D", "385", "358", "100", "108", "180", "1DB", "1CB", "54B", "54C", "102", "5C0", "5BF", "421", "54A", "1DC", "103", "625", "510", "1F2", "59B", "59C", "793", "1D5", "176", "58A", "5A9", "551"];
    },
    parseResponse: function parseResponse(response, request) {

      if (this.get('playingTrip')) {
        return;
      }
      //this.get('logManager').log("Response: " + response);
      response = response.replace(/>|\s/g, '');

      var responseType = "";
      if (this.get('flowManager').currentRequest == 'dtc') {
        responseType = response.substring(0, 3);
        response = response.substring(response.indexOf(responseType));
        var splitResponseMsg = response.split(response);
        this.parseDTC(responseType, splitResponseMsg);
      } else {
        responseType = response.substring(0, 3);
        //some 7BB are split between lines
        if (responseType == "7BB" && request.match("022102")) {
          this.parseCellVoltage(response);
        } else if (responseType == "7BB" && request.match("022104")) {
          this.parseCellTemp(response);
          voltageStore = [];
        } else if (responseType == "7BB" && request.match("022106")) {
          this.parseCellShunt(response);
        } else {
          if (responseType !== this.get('lastParsed') || responseType == "7BB") {

            //this.knownMessages().forEach((responseMsg) => {
            //if(responseType == responseMsg) {
            //responseMsg = responseMsg.substring(responseMsg.indexOf(responseMsg));
            //this.set('data.carIsOff', false);
            var _splitResponseMsg = response.split(responseType);
            //console.log("Split", splitResponseMsg);
            _splitResponseMsg.forEach( (msg) => {
              if (msg.length > 4) {

                //console.log("Found " + responseMsg + " message: " + msg);
                this.parseMsg(responseType, msg, request);
              }
            });

            //this.updatedProperties();

            //response = response.substring(response.indexOf(responseMsg), 16 + response.indexOf(responseMsg));
            //this.get('logManager').log("Parsed response ", response);
            //}
            //});
          }
        }
      }
      if (this.get('lastParsed') !== responseType) {
        this.set('lastParsed', responseType);
        this.get('logManager').log("Sent " + request);
        //console.log(response);
        this.get('logManager').log("Parsing " + responseType);
        this.updatedProperties();
      }
    },

    parseMsg: function parseMsg(code, msg, request) {
      var splitMsg = msg.match(/.{1,2}/g);
      //console.log(splitMsg);
      switch (code) {
        case "7BB":
          this.get('logManager').log("Got 7BB BMS message " + msg + " for requst " + request);
          if (request.match(/022101/)) {
            this.parseLBCData(splitMsg);
          }
          break;
        case "79A":
          this.get('logManager').log("Got 79A " + msg);
          this.parse79A(splitMsg);
          break;
        case "763":
          this.get('logManager').log("Got 763 " + msg);
          //this.parseCarCan(splitMsg);
          break;
        case "765":
          this.get('logManager').log("Got 765 " + msg);
          //this.parseCarCan(splitMsg);
          break;
        case "793":
          this.get('logManager').log("Got 793 " + msg);
          this.parseCarCan(splitMsg);
          break;
        case "625":
        case "358":
          this.get('logManager').log("Got Headlight status: " + msg);
          this.setheadLights(splitMsg);
          break;
        case "60D":
          this.get('logManager').log("Got Turn Signal status: " + msg);
          this.setTurnSignal(splitMsg);
          break;
        case "5B3":
          this.get('logManager').log("Got battery SOH: " + msg);
          this.setSOH(splitMsg);
          break;
        case "54F":
          this.get('logManager').log("Got Climate Data " + msg);
          this.setACUsage(splitMsg);
          break;
        case "5BF":
          this.get('logManager').log("Got charging status?? " + msg);
          break;
        case "002":
          this.get('logManager').log("Got turning angle! " + msg);
          this.setTurnDegrees(splitMsg);
          break;
        case "385":
          this.get('logManager').log("Got tire pressures " + msg);
          this.setTirePressures(splitMsg);
          break;
        case "355":
          this.get('logManager').log("Got Vehicle speed! " + msg);
          this.setSpeed(splitMsg);
          break;
        case "5C5":
          this.get('logManager').log("Got ODO! " + msg);
          this.setOdometer(splitMsg);
          break;
        case "55B":
          this.get('logManager').log("Got SOC! " + msg);
          break;
        case "100":
          this.get('logManager').log("Got battery watts " + msg);
          break;
        case "421":
          console.log("Got 'transmission' status " + msg);
          this.setTransmission(splitMsg);
          break;
        case "102":
          this.get('logManager').log("Got charging current " + msg);
          break;
        case "108":
          this.get('logManager').log("Got available output current " + msg);
          break;
        case "108":
          this.get('logManager').log("Got output current " + msg);
          break;
        case "260":
          this.get('logManager').log("Got available regen " + msg);
          this.setAvailableRegen(splitMsg);
          break;
        case "5C0":
          console.log("Got possible charging/discharging current " + msg);

          break;
        case "180":
          this.get('logManager').log("Got motor Amps " + msg);
          this.setMotorAmps(splitMsg);
          break;
        case "176":
          this.get('logManager').log("Got motor Volts " + msg);
          this.setMotorVolts(splitMsg);
          break;
        case "54B":
          this.get('logManager').log("Got Climate data B" + msg);
          this.setClimateDataB(splitMsg);
          break;
        case "54A":
          this.get('logManager').log("Got Climate data A " + msg);
          this.setClimateDataA(splitMsg);
          break;
        case "1DB":
          this.get('logManager').log("Got Battery current " + msg);
          break;
        case "1DC":
          this.get('logManager').log("Got Battery KW usage " + msg);
          this.setBatteryWatts(splitMsg);
          break;
        case "284":
          this.get('logManager').log("Got distance traveled " + msg);
          //this.setDistanceTraveled(splitMsg);
          this.setWheelSpeed(splitMsg);
          break;
        case "510":
          this.get('logManager').log("Got climate power usage " + msg);
          this.setClimateConsumption(splitMsg);
          break;
        case "1F2":
          this.get('logManager').log("Got charging state " + msg);
          break;
        case "59B":
          this.get('logManager').log("Got charging status 1 " + msg);
          break;
        case "59C":
          this.get('logManager').log("Got charging status 2 " + msg);
          break;
        case "292":
          this.get('logManager').log("Got 12v Battery voltage " + msg);
          this.set12vBattery(splitMsg);
          break;
        case "1D5":
          this.get('logManager').log("Got regen braking " + msg);
          this.setRegen(splitMsg);
          break;
        case "1CB":
          this.get('logManager').log("Got target braking " + msg);
          this.setBraking(splitMsg);
          break;
        case "58A":
          this.get('logManager').log("Got Parking Brake " + msg);
          this.setParkingBrake(splitMsg);
          break;
        case "5A9":
          this.get('logManager').log("Got maybe important 5A9 " + msg);
          this.setChargeStatus(splitMsg);
          break;
        case "551":
          this.get('logManager').log("Got Cruise Control " + msg);
          this.setCruiseControl(splitMsg);
          break;
        case "54C":
          this.get('logManager').log("Got Outside Temp " + msg);
          this.setOutsideTemp(splitMsg);
          break;
        case "35D":
          this.get('logManager').log("Got Wiper status, maybe more " + msg);
          //this.setCruiseControl(splitMsg);
          break;
        case "280":
          this.get('logManager').log("Got Seat Belts " + msg);
          this.setSeatBelts(splitMsg);
          break;
        case "380":
          this.get('logManager').log("Got QC status " + msg);
          this.setQCStatus(splitMsg);
          break;
        default:
        //console.log("Could not find message meaning");
      }
    },

    parseDTC: function parseDTC(responseType, splitResponseMsg) {
      switch (responseType) {
        case "764":

          break;
        case "7BB":

          break;
        case "76D":

          break;
        case "763":

          break;
        case "78C":

          break;
        case "767":

          break;
        case "7BD":

          break;
        default:

      }
    }

});
