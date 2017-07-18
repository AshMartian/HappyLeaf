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
  flowManager: Ember.inject.service('flow-manager'),
  logManager: Ember.inject.service('log-manager'),
  playingTrip: false,
  tripIndex: 0,
  tripCount: 0,

  lastUpdateTime: null,
  SOH:  0,
  GIDs: 256,
  batteryTemp:  0,
  tempOffset: 100,
  isCharging: false,
  batteryVolts: 0,
  headLights: false,
  fogLights: false,
  turnSignal: "Off",
  odometer: 0,
  distanceUnits: "M",

  distanceTraveled: 0,
  rawDistanceTraveled:  null,
  calculatedDistanceTraveled:  null,
  distancePerKW:  0,
  wattsPerDistance: 0,
  transmission: "T",

  speed: 0,
  averageSpeed: 0,
  speedLog: [],

  turnAngle: 0,

  watts:  0,
  kilowatts: 0,

  wattsUsed:  0,
  wattsStarted:  0,
  wattsStartedTime: null,
  wattsStartedCharging:  null,

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
  hx:  100,
  SOCDifference: 0,
  capacityAH:  0,

  accVolts:  0,

  wattsPerSOC: 170,

  tire1:  0,
  tire2: 0,
  tire3: 0,
  tire4: 0,
  tireDelta: 0,

  chargingVolts: 0,
  chargingAmps: 0,
  chargingWatts: 0,

  cellVoltages: [],
  cellVoltDelta:  0,
  cellTemps: [],
  cellTempDelta:  0,
  cellShunts:  "",

  parkingBrakeOn: false,


  cruiseControlOn: null,

  isBuckled: false,
  ODOUnits: "M",

  distanceOffset: 0,
  carIsOff: false,

  startTime: (new Date()).getTime(),
  endTime: null,

  availableData: function(typeOverride) {
    var isValid = function(val) {
      if(typeof typeOverride == 'string'){
        return typeof val == typeOverride && val;
      } else {
        return typeof val !== 'array' && typeof val !== 'object' && typeof val !== 'function' && val !== null && val !== "";
      }
    }, availableKeys = [];
    
    var keys = Object.getOwnPropertyNames(this);
    //console.log("Checking available data", keys, this);
    
    for(var i = 0; i < keys.length; i++){
      var key = keys[i];
      if(!key.match(/\_|play|last|watch/i) && isValid(this[key])) availableKeys.push(key);
      //console.log(index);
      if(i === keys.length - 1) {
        console.log("Got available keys", availableKeys);
        return availableKeys;
      }
    }
  },

  getTrip() {
    return tripStore;
  },

  historyCreated: function() {
    //clear any averages
    this.set('startTime', (new Date()).getTime());
    this.set('endTime', null);
    this.set('startWatts', this.watts);
    this.set('averageClimateUsage', 0);
    this.set('averageMotorAmps', 0);
    this.set('averageRegenWatts', 0);
    this.set('averageMotorVolts', 0);
    this.set('peakMotorWatts', 0);
    //this.dataSinceHistory = {};
    averageLogs = {};
  },

  reset: function(){
    this.set('wattsStartedTime', (new Date()).getTime());
    this.set('odometer', 0);
    this.set('accVolts', 0);
    this.set('capacityAH', 0);
    this.set('distanceTraveled', 0);
    this.set('distancePerKW', 0);
    this.set('batteryTemp', 0);
    this.set('GIDs', 0);
    this.set('SOH', 0);
    this.set('dataSinceHistory', {});
    this.set('properties', 0);
    this.get('logManager').resetHistoryName();
  },

  loadTrip: function(tripData) {
    tripStore = tripData;
    this.set('playingTrip', true);
    this.set('tripCount', Object.keys(tripData).length);
    console.log("Trip length ", this.get('tripCount'));
    this.setTripIndex(0);
  },

  setTripIndex(index) {
    if(!index) index = 0;
    this.set('tripIndex', index);
    var firstKey = Object.keys(tripStore)[index];
    Object.keys(tripStore[firstKey]).forEach((currentKey) => {
      this.set(currentKey, tripStore[firstKey][currentKey]);
      this.gotDataFor(currentKey, tripStore[firstKey][currentKey]);
    });
    this.updatedProperties();
  },
  observeIndex: function(){
    var lastIndex = this.get('tripIndex');
    //console.log(this.get('tripIndex'));
    Ember.run.later((() => {
      if(this.get('tripIndex') == lastIndex) {
        this.setTripIndex(lastIndex);
      }
    }), 30);
    //this.setTripIndex(this.get('tripIndex'));
  }.observes('tripIndex'),

  callSubscriptions() {
    //console.log("Calling functions for updates.");
  },

  properties: 0,
  updatedProperties() {
    if(this.properties < Object.keys(this).length ) {
      this.set('properties', this.properties + 1);
    } else {
      this.set('properties', 0);
      var now = (new Date()).getTime();
      if(!this.playingTrip) {
        var currentDataManager = {};
        Object.keys(this).forEach((key) => {
          if(typeof this[key] !== 'function'){
            currentDataManager[key] = this[key];
          }
        });
        tripStore[now] = currentDataManager;
        var tripLength = Object.keys(tripStore).length;
        console.log("Trip length ", tripLength);
        if(tripLength % 5) {
          this.get('logManager').saveHistory();
        }
      }
    }
  },

  getAverage: function(key, value) {
    if(!averageLogs[key]) averageLogs[key] = [];
    averageLogs[key].push(value);
    var averageSum = 0;
    averageLogs[key].forEach(function(averagePoint){
      averageSum = averageSum + averagePoint;
    });
    return averageSum / averageLogs[key].length;
  },

  dataSinceHistory: {},
  hasDataFor: function(key) {
    if(this.dataSinceHistory.hasOwnProperty(key)){
      return true;
    } else {
      return false;
    }
  },

  gotDataFor: function(key, value) {
    this.set(`dataSinceHistory.${key}`, value);
  },


 setheadLights: function(splitMsg){//expects array of two length strings
    var byte=splitMsg[1];
    console.log("Parsing byte: " + byte);
    if(byte == "00"){
     this.set('headLights', false);
     this.set('fogLights', false);
    } else if(byte == "60"){
     this.set('headLights', true);
     this.set('fogLights', false);
    } else if(byte == "68"){
     this.set('headLights', true);
     this.set('fogLights', true);
    }
    this.callSubscriptions();
  },

 setTurnSignal: function(splitMsg){//expects array of two length strings
    var byte=splitMsg[1];
    if(byte == "06") {
     this.set('turnSignal', "Off");
    } else if(byte == "26") {
     this.set('turnSignal', "left");
    } else if(byte == "46") {
     this.set('turnSignal', "right");
    }
    this.callSubscriptions();
  },

 setSOH: function(splitMsg){
   if(splitMsg.length !== 8){
     this.get('logManager').log("SOH Message length invalid " + splitMsg.length);
     return;
   } else {
     var previousGIDs = this.GIDs;
     var tempByte = splitMsg[0];
     var previousBatteryTemp = this.batteryTemp;
     var batteryTempC = (parseInt(tempByte, 16) * .25);
     var batteryTempF = ((batteryTempC * 9) / 5) + 32;

     var SOHbyte = splitMsg[1];
     var lastSOH = this.SOH;
     this.set('SOH', (parseInt(SOHbyte, 16) / 2));
     var GIDByte = splitMsg[5];
     this.set('GIDs', parseInt(GIDByte, 16));


     //this.tempOffset = Math.abs(((batteryTempF / 70 * 100) / 4));
     var tempDifference = 70 - batteryTempF;
     if(tempDifference > 0) {
       tempDifference = tempDifference / 4;
     } else {
       tempDifference = tempDifference / 8;
     }
     this.set('tempOffset', 100 - tempDifference);

     if(!this.actualSOC) {
       return;
     }

     var wattsFromGIDs = Math.abs((this.GIDs * 0.775) * this.tempOffset);
     var kWFromGIDs = wattsFromGIDs / 1000;

     //Essentially calculate Kw from SOC and make sure it roughly aligns with GIDs. If it doesn't, likley over 255..
     if(this.actualSOC && this.hasDataFor('actualSOC')) {
       var kWFromSOC = Math.round((this.actualSOC * 170) / 1000);

       if(kWFromSOC > kWFromGIDs + 3 && this.GIDs < 200) {
         this.set('GIDs', this.GIDs + 255);
         wattsFromGIDs = (this.GIDs * 0.775) * this.tempOffset;
         kWFromGIDs = wattsFromGIDs / 1000;
       }
       GIDsConfirmed = true;
     }
     this.get('logManager').log("GIDs: " +this.GIDs+" Temp: "+batteryTempF+" offset = " + this.tempOffset + " GID watts " + wattsFromGIDs);

     if(this.get('settings.settings.experience.tempUnits') == "F"){
       this.set('batteryTemp',  batteryTempF); //convert to F
     } else {
       this.set('batteryTemp', batteryTempC);
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
     if(previousGIDs != this.GIDs || wattsFromGIDs > this.watts + 77.5 || wattsFromGIDs < this.watts - 77.5){
       this.set('wattDifference', wattsFromGIDs - this.watts);
       this.set('watts', wattsFromGIDs);
       this.set('kilowatts', kWFromGIDs);
       this.getWattsPerSOC();
     } else if(previousGIDs != this.GIDs && this.hasDataFor('actualSOC')){
       this.getWattsPerSOC();
     }

     if(this.wattsStarted == 0 || !this.wattsStartedTime || this.wattsStartedTime < this.startTime - (1000 * 60 * 60 * 8)) {
       this.setWattsWatcher();
     } else {
       this.set('wattsUsed', this.wattsStarted - this.watts);
     }
     this.callSubscriptions();
     this.gotDataFor('SOH', this.SOH);
     this.gotDataFor('GIDs', this.GIDs);
     this.gotDataFor('batteryTemp', this.batteryTemp);
   }
 },

 setWattsWatcher: function(){
   this.set('wattsStarted', this.watts);
   this.set('wattsStartedTime', this.startTime);
   this.set('wattsStartedCharging', this.isCharging);
   this.set('wattsStartedODO', this.odometer);
   this.set('wattsUsed', 0);
   this.set('distanceTraveled', 0);
   //$localStorage.currentTripStart = null;
 },//reset watt tracker

 set12vBattery: function(splitMsg) {
   this.set('accBattVolts', parseInt(splitMsg[3], 16) / 10);
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

 setOdometer: function(splitMsg){
   if(splitMsg.length !== 8){
     this.get('logManager').log("Odometer message invalid length " + splitMsg.length);
     return;
   }
    var ODObyte = splitMsg[1] + splitMsg[2] + splitMsg[3];
    var rawUnits = splitMsg[7];
    if(rawUnits == "40" || this.get('settings.settings.experience').distanceUnits == "K") {
      this.set('distanceUnits', "K");
    }
    var lastODO = this.odometer;

    var newODO = parseInt(ODObyte, 16);
    if(newODO != lastODO){
      this.set('odometer', newODO);
    }

    if((this.distanceUnits != this.ODOUnits && this.distanceUnits != null && this.ODOUnits !== null) || this.get('settings.settings.experience').distanceUnits != this.ODOUnits) {
      if(this.ODOUnits == "M" && (this.distanceUnits == "K" || this.get('settings.settings.experience').distanceUnits == "K")) {
        this.set('odometer', this.odometer * 1.60934);
      }
      if(this.ODOUnits == "K" && (this.distanceUnits == "M" || this.get('settings.settings.experience').distanceUnits == "M")) {
        this.set('odometer', this.odometer * 0.621371);
      }
    }

   /*if(lastODO < this.odometer && this.distanceWatcher) { //if the rawDistanceTraveled is more than the watcher, it must have reset
     this.distancePerMile = this.rawDistanceTraveled - this.distanceWatcher;
   }*/

   if(lastODO < this.odometer && lastODO != 0) {
     this.set('history.mileDriven', this.get('history.milesDriven') + 1);
     this.set('history.milesDrivenToday', this.get('history.milesDrivenToday') + 1);
     if(this.get('history.currentTripStart') !== null && this.get('history.currentTripStart.odometer')){
       var odoAtBeginning = this.get('history.currentTripStart.odometer') - this.get('history.currentTripStart.distanceOffset');
       this.set('distanceTraveled', this.odometer - odoAtBeginning);
     }

     this.set('lastODOTime', (new Date()).getTime());
   }
   this.gotDataFor('odometer', this.odometer);
   //this.callSubscriptions();
 },

 setSpeed: function(splitMsg) {
   if(splitMsg.length < 7){
     this.get('logManager').log("Speed message invalid length");
     return;
   }
    var rawSpeed = parseInt(splitMsg[0] + splitMsg[1], 16);
    var units = splitMsg[4];
    var KMH = rawSpeed / 100;
    var ODOUnits = splitMsg[6];
    if(ODOUnits == "60"){
      this.set('ODOUnits', "M");
    } else if(ODOUnits == "40") {
      this.set('ODOUnits', "K");
    }
    if(units == "00" && this.get('settings.settings.experience').distanceUnits == "K") {
      this.set('speed', KMH + "kmh");
      this.get('logManager').log("Vehicle set to Kilometers");
      this.set('distanceUnits', "K");
      if(!this.get('settings.settings.experience').distanceUnits) {
        this.get('settings.settings.experience').distanceUnits = "K";
      }
      if(!this.get('settings.settings.experience').tempUnits) {
        this.get('settings.settings.experience').tempUnits = "C";
      }
   }
   if (units == "20" && this.get('settings.settings.experience').distanceUnits == "M") {
      this.set('speed', parseInt(KMH * 0.621371) + "mph"); //kmh to mp)h
      this.set('distanceUnits', "M");
      if(!this.get('settings.settings.experience').distanceUnits) {
        this.get('settings.settings.experience').distanceUnits = "M";
      }
      if(!this.get('settings.settings.experience').tempUnits) {
        this.get('settings.settings.experience').tempUnits = "F";
      }
     //console.log("Vehicle set to Miles")
    }

    var now = (new Date()).getTime()
    if(this.lastSpeedTime){
      var timeDifference = now - this.lastSpeedTime;
      var distanceSinceLastSpeed = parseInt(this.speed) / ((1000 * 60 * 60) / timeDifference);
      this.set('distanceTraveled', this.get('distanceTraveled') + distanceSinceLastSpeed);
      this.set('distanceOffset', this.distanceTraveled % 1);
    }

    this.set('lastSpeedTime', now);

    this.set('averageSpeed', this.getAverage('speed', parseInt(this.speed)));

    this.callSubscriptions();
    this.gotDataFor('speed', this.speed);
  },

  setWheelSpeed(splitMsg) {
    var speed = parseInt(splitMsg[4] + splitMsg[5], 16) * 0.0245; //
    this.set('wheelSpeedRight', parseInt(splitMsg[0] + splitMsg[1], 16) * 0.0118); //*0.0118
    this.set('wheelSpeedLeft', parseInt(splitMsg[2] + splitMsg[3], 16) * 0.0118); // *0.0118

    if(this.get('settings.settings.experience').distanceUnits == "K") {
      this.set('speed', speed + "kmh");
      this.get('logManager').log("Vehicle set to Kilometers");
   }
   if (this.get('settings.settings.experience').distanceUnits == "M") {
      this.set('speed', parseInt(speed * 0.621371) + "mph"); //kmh to mph
      
      
    }
  },

 setTransmission: function(splitMsg) {
    var transmissionByte = splitMsg[0];
    //this.log("Transmission byte: " + transmissionByte);
    if(transmissionByte == "08") {
     this.set('transmission', "P");
    } else if(transmissionByte == "18") {
     this.set('transmission', "N");
    } else if(transmissionByte == "20") {
     this.set('transmission', "D");
    } else if(transmissionByte == "10") {
     this.set('transmission', "R");
    } else if(transmissionByte == "38") {
      if(this.distanceUnits == "M" || this.ODOUnits == "M"){ //TODO: IDENTIFY NEWER VEHICLES WITH "B" MODE, LEARN HOW TO DETECT THEIR E MODE
        this.set('transmission', "E");
      } else {
        this.set('transmission', "B");
      }

    }
    this.callSubscriptions();
    this.gotDataFor('transmission', this.transmission);
  },

  setChargeStatus: function(splitMsg){
    var chargeByte = splitMsg[0];
    var currentCharging = this.isCharging;
    if(chargeByte == "FF") {
      this.set('isCharging', true);
    } else {
      this.set('isCharging', false);
    }
    if(this.isCharging != currentCharging || this.isCharging !== this.wattsStartedCharging || this.startTime > this.wattsStartedCharging + 16000 && parseInt(this.speed) != 0 ) {
      //$rootScope.$broadcast('changeCharging');
      setTimeout(() => {
        if(this.isCharging !== currentCharging) {
          this.setWattsWatcher();
        }
      }, 15000);

    }
  },

  setCruiseControl: function(splitMsg){
    var chargeByte = splitMsg[4];

    if(chargeByte == "80") {
      this.set('cruiseControlOn', true);
    } else {
      this.set('cruiseControlOn', false);
    }
  },

  setSeatBelts: function(splitMsg){
    var beltByte = splitMsg[0];

    if(beltByte == "03") {
      this.set('isBuckled', false);
    } else if(beltByte == "01") {
      this.set('isBuckled', true);
    }
  },

  setParkingBrake: function(splitMsg){
    var PBOn = splitMsg[0];
    if(PBOn == "16") {
      this.set('parkingBrakeOn', true);
    } else {
      this.set('parkingBrakeOn', false);
    }
  },

 setTurnDegrees: function(splitMsg) {
    var degreesHex = splitMsg[0] + splitMsg[1];
   this.set('turnAngle', parseInt(degreesHex, 16) / 10);
   //this.callSubscriptions();
 },

 setTirePressures: function(splitMsg) {
   if(splitMsg.length < 7){
     this.get('logManager').log("Tire message invalid length");
     return;
   }
   var tire1 = parseInt(splitMsg[2], 16) / 4;
   var tire2 = parseInt(splitMsg[3], 16) / 4;
   var tire3 = parseInt(splitMsg[4], 16) / 4;
   var tire4 = parseInt(splitMsg[5], 16) / 4;
   if(tire1 != 0) {
     this.set('tire1', tire1);
   }
   if(tire2 != 0) {
     this.set('tire2', tire2);
   }
   if(tire3 != 0) {
     this.set('tire3', tire3);
   }
   if(tire4 != 0) {
     this.set('tire4', tire4);
   }

   this.set('tireHighest', Math.max(this.tire1, this.tire2, this.tire3, this.tire4));
   this.set('tireLowest', Math.min(this.tire1, this.tire2, this.tire3, this.tire4));
   this.set('tireDelta', Math.abs(this.tireHighest - this.tireLowest));
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
   this.gotDataFor('tires', this.tire1);
   this.callSubscriptions();
 },

 setClimateDataA: function(splitMsg){
   this.set('climateSetPoint', parseInt(splitMsg[4], 16));
   var outside = parseInt(splitMsg[7], 16) - 41;
   if(outside > -40) {
     this.set('outsideTemp', outside);
   }
   //this.callSubscriptions();
   if(this.get('settings.settings.experience').tempUnits == "C") {
     this.set('outsideTemp', ((this.outsideTemp - 32) * 5 ) / 9);
     this.set('insideTemp', ((this.insideTemp - 32) * 5 ) / 9);
   }
 },

 setClimateDataB: function(splitMsg){
   var CCOn = splitMsg[0];
   if(CCOn == "01") {
     this.set('climateOn', false);
   } else if(CCOn == "00") {
     this.set('climateOn', true);
   }

   var ventMode = splitMsg[2];
   if(ventMode == "88") {
     this.set('ventMode', "Face");
   } else if(ventMode == "90"){
     this.set('ventMode', "Face/Feet");
   } else if(ventMode == "98") {
     this.set('ventMode', "Feet");
   } else if(ventMode == "A0") {
     this.set('ventMode', "Feet/Def");
   } else if(ventMode == "A8") {
     this.set('ventMode', "Def");
   } else if(ventMode == "80") {
     this.set('ventMode', "Off");
   }

   this.set('fanSpeed', parseInt((splitMsg[4], 16) - 4) / 8);
   this.callSubscriptions();
 },

 setClimateConsumption: function(splitMsg){
   if(splitMsg.length !== 8){
     this.get('logManager').log("Climate message invalid length");
     return;
   }
   var oldConsumption = this.climateConsumption;
   var consumption = parseInt(splitMsg[3], 16).toString(2);
   //consumption = consumption.substring(4, consumption.length);
   var totalConsumption = 0;
   for(var i = 0; i < consumption.length; i++){
     totalConsumption = totalConsumption + parseInt(consumption.charAt(i));
   }
   this.get('logManager').log("Climate Usage LSB: " + totalConsumption);
   this.set('climateConsumption', (totalConsumption * .25) * 1000);
   var outsideRaw = parseInt(splitMsg[7], 16);
   //this.outsideTemp = parseInt(outsideRaw, 16) - 56;

   //if(oldConsumption != this.climateConsumption){
     //this.callSubscriptions();
   //$rootScope.$broadcast('dataUpdate:Climate', this);
   if(this.climateConsumption !== 0){
     this.set('averageClimateUsage', this.getAverage('climateConsumption', this.climateConsumption));
   }
   this.gotDataFor('climateConsumption', this.climateConsumption);
   //}
 },

 parseLBCData: function(splitMsg){
   var group = parseInt(splitMsg[0], 16);
   if(splitMsg.length !== 8){
     this.get('logManager').log("Cannot parse 7BB, invalid length: " + splitMsg.length);
     return;
   }
   if(splitMsg[0] == "24"){
     this.set('hx', parseInt(splitMsg[2] + splitMsg[3], 16) / 100);
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
     var previousSOC = this.actualSOC;
     if(fullSOC / 10000 <= 100){
      this.set('actualSOC', fullSOC / 10000);
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
     if(this.wattsPerSOC && GIDsConfirmed) {
       this.set('wattDifference', (this.actualSOC - previousSOC) * this.wattsPerSOC);
       this.set('watts', this.watts + this.wattDifference);
       this.set('kilowatts', this.watts / 1000);
       this.set('wattsUsed', this.wattsStarted - this.watts);
       if(this.wattsUsed < -400 && this.speed == 0) { //TODO: Don't do this
         this.set('isCharging', true);
       }
       this.getWattsPerMinute();
     }
     this.getDistancePerWatt();

     if(this.actualSOC > previousSOC + 100 && !this.hasDataFor('actualSOC') && !this.isCharging) {
       this.setWattsWatcher();
     }

     //$rootScope.$broadcast('dataUpdate:SOC', this);
     this.gotDataFor('actualSOC', this.actualSOC);
   } else if(splitMsg[0] == "25"){
     var AH = parseInt(splitMsg[2] + splitMsg[3] + splitMsg[4], 16);
     this.set('capacityAH', AH / 10000);
   } else if(splitMsg[0] == "23"){
     var VCC = parseInt(splitMsg[3] + splitMsg[4], 16);
     this.set('accVolts', VCC / 1024);
     this.gotDataFor('accVolts', this.accVolts);
     this.set('batteryVolts', parseInt(splitMsg[1] + splitMsg[2], 16) / 100);
     this.get('logManager').log("Got battery volts: " + this.batteryVolts);
     /*if(this.accVolts < 11 && this.accVolts > 6) {
       $rootScope.$broadcast('notification', {
         title: $translate.instant("NOTIFICATIONS.LOW_12V.TITLE"),
         time: (new Date()).getTime(),
         seen: false,
         content: $translate.instant("NOTIFICATIONS.LOW_12V.CONTENT", {volts: this.accVolts}),
         icon: "battery_20"
       });
     }*/
   }
   this.callSubscriptions();
 },


 parseCellVoltage: function(response) {
   var simpleVoltages = [];
   response = response.replace(/7BB/g, '');
   //this.get('logManager').log("parsing cell voltage " + response);
   if(response.length > 17) {
     var splitResponse = response.match(/.{1,8}/g);
     for(var r = 0; r < splitResponse.length; r++){
       var splitMsg = splitResponse[r].match(/.{1,2}/g);
       splitMsg.shift();
       for(var i = 3; i < (splitMsg.length - 3); i += 2){
         simpleVoltages.push((parseInt(splitMsg[i - 1] + splitMsg[i], 16)) / 1000);
       }
     }

   } else {
     //response.substring(3, response.length - 1);
     voltageStore.push(response);
     //console.log(voltageStore.length);
     if(voltageStore.length >= 29) {
       //console.log("Got all cell voltages ", voltageStore);
       var allData = "";
       for(var r = 0; r < voltageStore.length; r++){
         var splitMsg = voltageStore[r].match(/.{1,2}/g);
         var number = splitMsg.shift();
         //console.log(number, splitMsg);
         if(number == "10") {
           splitMsg.splice(0, 3);
         }
         //console.log(splitMsg.join(""));
         allData = allData + splitMsg.join("");
       }
       //console.log(allData);
       var allMsgs = allData.match(/.{1,2}/g);
       //console.log(allMsgs);
       for(var i = 1; i < allMsgs.length; i += 2){
         if(simpleVoltages.length < 96){
           simpleVoltages.push((parseInt(allMsgs[i - 1] + allMsgs[i], 16)) / 1000);
         }
       }
       //console.log("Finished processing " + simpleVoltages.length + " voltages", simpleVoltages);
       this.set('cellVoltages', simpleVoltages);
       this.set('cellVoltHighest', Math.max.apply(null, this.cellVoltages));
       this.set('cellVoltLowest', Math.min.apply(null, this.cellVoltages));
       this.set('cellVoltDelta', Math.round(Math.abs(this.cellVoltHighest - this.cellVoltLowest) * 1000));

       //$rootScope.$broadcast('dataUpdate:Volts');
       /*for(var i = 0; i < 96, i++) {
         simpleVoltages.push((parseInt(splitMsg[i* 4] + splitMsg[i], 16)) / 1000);
       }*/
     }
   }

   //console.log(simpleVoltages.length, "cells", simpleVoltages);

 },

 parseCellTemp: function(originalResponse) {

   var parseResponse = (response) => {
     var splitMsg = response.match(/.{1,2}/g);
     //console.log("Temp message "+response+" for ", splitMsg[0]);
     if(splitMsg[0] == "10") {
       tempStore = [];
       tempStore.push(splitMsg[4]);
       tempStore.push(splitMsg[5]);
       tempStore.push(splitMsg[6]);
       tempStore.push(splitMsg[7]);
     } else if(splitMsg[0] == "21") {
       splitMsg.shift();
       tempStore = tempStore.concat(splitMsg);
     } else if(splitMsg[0] == "22") {
       tempStore.push(splitMsg[1]);
       //console.log(tempStore);
       var mochTemps = [];
       for(var i = 2; i < tempStore.length; i+= 3) {
         var cellTempRaw = parseInt(tempStore[i - 2] + tempStore[i - 1], 16);

         var cellTempC = parseInt(tempStore[i], 16);
         //console.log("Raw temp, " + cellTempRaw + " C temp = " + cellTempC );
         if(this.get('settings.settings.experience').tempUnits == "F"){
           cellTempC =  ((cellTempC * 9) / 5) + 32; //convert to F
         }
         if(cellTempC < 250) {
           mochTemps.push(cellTempC);
         }
       }
       //console.log("New cell temps", mochTemps);
       this.set('cellTemps', mochTemps);
       this.set('cellTempHighest', Math.max.apply(null, this.cellTemps));
       this.set('cellTempLowest', Math.min.apply(null, this.cellTemps));
       this.set('cellTempDelta', Math.round(Math.abs(this.cellTempHighest - this.cellTempLowest)));

       this.callSubscriptions();
     }
   };

   originalResponse = originalResponse.replace(/7BB/g, '');
   if(originalResponse.length > 17) {
     var splitResponse = originalResponse.match(/.{1,8}/g);
     for(var i = 0; i < splitResponse.length; i++) {
       parseResponse(splitResponse[i]);
     }
   } else {
     parseResponse(originalResponse);
   }
 },

 parseCellShunt: function(originalResponse) {

   var parseResponse = (response) => {
     var splitMsg = response.match(/.{1,2}/g);
     console.log("Shunt message "+response+" for ", splitMsg[0]);
     if(splitMsg[0] == "10") {
       splitMsg = splitMsg.slice(4, splitMsg.length + 1);
       tempStore = splitMsg;
     } else if(splitMsg[0] == "21") {
       splitMsg.shift();
       tempStore = tempStore.concat(splitMsg);
     } else if(splitMsg[0] == "22") {
       splitMsg.shift();
       tempStore = tempStore.concat(splitMsg);
     } else if(splitMsg[0] == "23") {
       splitMsg.shift();
       splitMsg.pop();
       tempStore = tempStore.concat(splitMsg);
       console.log(tempStore);
       var mochShunts = [];
       for(var i = 0; i < tempStore.length; i++){
         var shunt = parseInt(tempStore[i], 16).toString(2);
         while(shunt.length < 4) {
           shunt += "0";
         }
         shunt = shunt.split("").reverse().join("");
         mochShunts += shunt;
       }

       console.log("New " + mochShunts.length + " shunts ", mochShunts);

       this.set('cellShunts', mochShunts);

       //$rootScope.$broadcast('dataUpdate:Shunts');
     }
   };
   originalResponse = originalResponse.replace(/7BB/g, '');
   if(originalResponse.length > 17) {
     var splitResponse = originalResponse.match(/.{1,8}/g);
     for(var i = 0; i < splitResponse.length; i++) {
       parseResponse(splitResponse[i]);
     }
   } else {
     parseResponse(originalResponse);
   }
 },

 getWattsPerSOC: function() {
   var wattsFromGIDs = (this.GIDs * 0.775) * this.tempOffset;
   if(wattsFromGIDs != this.wattsPerSOCWatcher && this.GIDs > 0 && this.hasDataFor('actualSOC')) {
     var wattDifference = Math.abs(this.wattsPerSOCWatcher - this.watts); //Watt difference, should be 77.5, maybe more
     var SOCDifference = Math.abs(this.actualSOC - this.lastSOC);
     //var wattsToSOCRound = wattDifference * (1 / SOCDifference);

     //$rootScope.$broadcast('log', {log: "SOC difference = " + SOCDifference});
     this.set('wattsPerSOC', wattsFromGIDs / this.actualSOC);
     this.set('wattsPerSOCWatcher', this.watts);
     this.set('lastSOC', this.actualSOC);
     this.set('SOCDifference', SOCDifference);
     //this.wattsPerSOC = this.wattsPerSOC * (1 / SOCDifference);
   } else if(this.actualSOC != 0 && !this.wattsPerSOCWatcher) {
     this.set('wattsPerSOCWatcher', wattsFromGIDs);
     this.set('lastSOC', this.actualSOC);
   } else if(this.GIDs == 0 && this.wattsPerSOC){
     //calculate based off of Watts per SOC
     this.set('watts', this.actualSOC * this.wattsPerSOC);
   }
 },

 getWattsPerMinute: function(){
   var now = (new Date()).getTime();
   var timeDifference = (now - this.startTime);
   var wattDifference = this.watts - this.startWatts;
   var timeToMinutes = (1000 * 60) / timeDifference;
   this.set('wattsPerMinute', wattDifference * timeToMinutes);
 },

 getDistancePerWatt: function(){
   if(this.distanceTraveled && this.wattsUsed > 0 && !this.isCharging && GIDsConfirmed) {
     this.set('distancePerKW', this.distanceTraveled / (this.wattsUsed / 1000));
     this.set('wattsPerDistance', this.wattsUsed / this.distanceTraveled);
   }
 },

 parseCarCan: function(splitMsg) {
   if(splitMsg.length !== 8){
     this.get('logManager').log("EVSE message invalid length: " + splitMsg.length);
     this.set('isCharging', false);
     return;
   }
   var type = splitMsg[3];
   if(type == "10") {
     var amps = parseInt(splitMsg[4] + splitMsg[5], 16) / 16;
     if(amps < 150){
       this.set('chargingAmps', amps);
     }
   }
   if(type == "30") {
     var volts = parseInt(splitMsg[4] + splitMsg[5], 16) / 128;
     this.set('chargingVolts', volts);
   }

   if(parseInt(this.chargingAmps) && parseInt(this.chargingVolts)){
     this.set('chargingWatts', parseInt(this.chargingAmps * this.chargingVolts));
   } else {
     this.set('chargingWatts', 0);
   }

   var currentCharging = this.isCharging;

   if(this.chargingVolts > 50 || (this.wattsUsed < 0 && this.wattsPerMinute > 60)){
     this.set('isCharging', true);
     if(this.wattsUsed > 0) {
       this.setWattsWatcher();
     }
   } else {
     this.set('isCharging', false);
   }

   if(currentCharging !== this.isCharging && this.chargingVolts < 1 && parseInt(this.speed) == 0){
     setTimeout(function(){
       if(this.isCharging !== currentCharging) {
         this.setWattsWatcher();
       }
     }, 15000);
   }

   this.callSubscriptions();
 },

 parse79A: function(splitMsg){
   if(splitMsg.length !== 8){
     this.get('logManager').log("79A message invalid length: " + splitMsg.length);
     return;
   }
   var type = splitMsg[0];
   if(type == "07") {
     this.get('logManager').log("Got climate Temperature");
     var outsideRaw = parseInt(splitMsg[5], 16);
     var insideRaw = parseInt(splitMsg[6], 16);
     var lastOutsideTemp = this.outsideTemp;
     this.set('outsideTemp', (outsideRaw + 41));
     this.set('insideTemp', (insideRaw + 41));

     if(this.get('settings.settings.experience').tempUnits == "C") {
       this.set('outsideTemp', ((this.outsideTemp - 32) * 5 ) / 9);
       this.set('insideTemp', ((this.insideTemp - 32) * 5 ) / 9);
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
   } else if(type == "03") {
     this.set('level3ChargeCount', parseInt(splitMsg[4] + splitMsg[5], 16));
     this.get('logManager').log("Got L3 Charge Count " + this.level3ChargeCount);
   } else if(type == "04") {
     this.set('level2ChargeCount', parseInt(splitMsg[4] + splitMsg[5], 16));
     this.get('logManager').log("Got L2 Charge Count " + this.level2ChargeCount);
   }
 },

 setQCStatus: function(splitMsg){
   this.set('chargingVolts', parseInt(splitMsg[3], 16));
   this.set('chargingAmps', parseInt(splitMsg[4], 16));
   if(this.chargingVolts > 10){
     this.set('isCharging', true);
   } else {
     this.set('isCharging', false);
   }
   this.callSubscriptions();
 },

 setMotorAmps: function(splitMsg){
   var oldAmps = this.rawMotorAmps;
   this.set('rawMotorAmps', parseInt(splitMsg[2] + splitMsg[3], 16));
   if(this.rawMotorAmps > 40000) {
     this.set('rawMotorAmps', (0 - 65535) + this.rawMotorAmps);
   }
   this.averageMotorAmps = this.getAverage('motorAmps', this.rawMotorAmps);
   if(this.rawMotorVolts){
     this.set('motorWatts', ((this.rawMotorAmps / 2) * (this.rawMotorVolts / 20)) / 8.5);
     this.set('averageMotorWatts', this.getAverage('motorWatts', this.motorWatts));
     if(this.motorWatts > this.peakMotorWatts) this.peakMotorWatts = this.motorWatts;
   } else {
     this.set('motorWatts', 0);
   }
   if(oldAmps != this.rawMotorAmps){
     //$rootScope.$broadcast('dataUpdate:Motor', this);
     this.callSubscriptions();
     this.gotDataFor('motorWatts', this.motorWatts);
   }
 },

 setMotorVolts: function(splitMsg){
   var oldVolts = this.rawMotorVolts;
   this.set('rawMotorVolts', parseInt(splitMsg[2] + splitMsg[3], 16));
   this.set('averageMotorVolts', this.getAverage('motorVolts', this.rawMotorVolts));
   if(this.rawMotorAmps){
     this.set('motorWatts', ((this.rawMotorAmps / 2) * (this.rawMotorVolts / 20)) / 8.5); //this shouldn't need /?
     this.set('averageMotorWatts', this.getAverage('motorWatts', this.motorWatts));
     if(this.motorWatts > this.peakMotorWatts) this.peakMotorWatts = this.motorWatts;
     if(this.motorWatts < 0) {
       this.set('averageRegenWatts', this.getAverage('regenWatts', Math.abs(this.motorWatts)));
     } else {
       this.set('motorWatts', 0);
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
   if(oldVolts != this.rawMotorVolts){
     this.callSubscriptions();
   }
   //console.log("Trying to numberize motoramps " + $factories('number')(this.motorAmps));
 },

 setAvailableRegen: function(splitMsg){
   this.set('availableRegen', parseInt(splitMsg[1], 16));
 },

 setBraking: function(splitMsg) {
   this.set('targetRegenBraking', parseInt(splitMsg[0] + splitMsg[1], 16));
   this.set('targetRegen', parseInt(splitMsg[2] + splitMsg[3], 16));
   this.callSubscriptions();
 },

 setRegen: function(splitMsg) {
   this.set('regenWatts', parseInt(splitMsg[1] + splitMsg[2]) * this.rawMotorVolts * 0.00002875);
   this.set('averageRegenWatts', this.getAverage('regenWatts', this.regenWatts));
   this.callSubscriptions();
 },

 setACUsage:function(splitMsg){
   this.set('ACUsage', parseInt(splitMsg[2], 16) * 50);
   this.set('alternateClimateUsage', parseInt(splitMsg[5], 16) * 300);
 },

 setDistanceTraveled: function(splitMsg) {
   var newDistanceTraveled = parseInt(splitMsg[6] + splitMsg[7], 16);
   if(newDistanceTraveled > this.rawDistanceTraveled && this.totalRawDistanceTraveled) {
     this.set('totalRawDistanceTraveled', this.totalRawDistanceTraveled + Math.abs(this.rawDistanceTraveled - newDistanceTraveled));
   } else {
     this.set('totalRawDistanceTraveled', newDistanceTraveled);
   }
   this.set('rawDistanceTraveled', newDistanceTraveled);

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
 knownMessages: function(){ return ["79A", "763", "765", "7BB", "79A", "5B3", "55B", "54A", "260", "280", "284", "292", "1CA", "1DA", "1D4", "355", "002", "551", "5C5", "60D", "385", "358", "100", "108", "180", "1DB", "1CB", "54B", "54C", "102", "5C0", "5BF", "421", "54A", "1DC", "103", "625", "510", "1F2", "59B", "59C", "793", "1D5", "176", "58A", "5A9", "551"]},
 parseResponse: function(response, request) {

   //this.get('logManager').log("Response: " + response);
   response = response.replace(/>|\s/g, '');

   if(response.length >= 3 && response.indexOf("OK") == -1) {
     this.get('logManager').log("Sent " + request);
     //console.log(response);
     this.get('logManager').log("Parsing " + response.substring(0, 3));
   }
   if(this.get('flowManager').currentRequest == 'dtc'){
     var responseType = response.substring(0, 3);
     response = response.substring(response.indexOf(responseType));
     var splitResponseMsg = response.split(response);
     this.parseDTC(responseType, splitResponseMsg);
   } else {
     var responseType = response.substring(0, 3);
     //some 7BB are split between lines
     if(responseType == "7BB" && request.match("022102")){
       this.parseCellVoltage(response);
     } else if(responseType == "7BB" && request.match("022104")){
       this.parseCellTemp(response);
       voltageStore = [];
     } else if(responseType == "7BB" && request.match("022106")){
       this.parseCellShunt(response);
     } else {
       this.knownMessages().forEach((responseMsg) => {
         if(responseType == responseMsg) {
           //responseMsg = responseMsg.substring(responseMsg.indexOf(responseMsg));
           var splitResponseMsg = response.split(responseMsg);
           splitResponseMsg.forEach((msg) => {
             if(msg.length > 6){
               //this.get('logManager').log("Found " + responseMsg + " message: " + msg);
               this.parseMsg(responseMsg, msg, request);
             }
           })
          
          //this.updatedProperties();
           
           //response = response.substring(response.indexOf(responseMsg), 16 + response.indexOf(responseMsg));
           //this.get('logManager').log("Parsed response ", response);
         }
       });
     }
   }

   this.updatedProperties();
 },

 parseMsg: function(code, msg, request){
   var splitMsg = msg.match(/.{1,2}/g);
   //console.log(splitMsg);
   switch (code) {
     case "7BB":
       this.get('logManager').log("Got 7BB BMS message " + msg + " for requst " + request);
       if(request.match(/022101/)) {
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
       this.get('logManager').log("Got 'transmission' status " + msg);
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
       this.get('logManager').log("Got possible charging/discharging current " + msg);
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
         //this.setChargeStatus(splitMsg);
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

 parseDTC: function(responseType, splitResponseMsg) {
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
