happyLeaf.factory('dataManager', ['$rootScope', '$localStorage', function($rootScope, $localStorage){
  if($localStorage.history){
    var lastHistoryKey = Object.keys($localStorage.history)
    var lastHistoryItem = $localStorage.history[lastHistoryKey[lastHistoryKey.length - 1]];
    console.log("Last history item ", lastHistoryItem);
  }

  if(!lastHistoryItem) {
    lastHistoryItem = {};
  }

  var self = {

    SOH: lastHistoryItem.SOH || 0,
    GIDs: lastHistoryItem.GIDs || 0,
    batteryTemp: 0,
    isCharging: lastHistoryItem.isCharging || null,
    headLights: false,
    fogLights: false,
    turnSignal: "Off",
    odometer: lastHistoryItem.odometer || 0,
    distanceUnits: lastHistoryItem.distanceUnits || "M",
    readableDistanceUnits: function(){
      if(self.distanceUnits == "M") {
        return "Miles";
      } else {
        return "Kilometers";
      }
    },
    distanceTraveled: 0,
    rawDistanceTraveled: null,
    calculatedDistanceTraveled: null,
    distancePerKW: lastHistoryItem.distancePerKW || 0,
    wattsPerDistance: lastHistoryItem.wattsPerDistance || 0,
    transmission:  lastHistoryItem.transmission || "T",

    speed: 0,
    averageSpeed: 0,
    speedLog: [],

    turnAngle: 0,

    watts: lastHistoryItem.watts || 0,
    killowatts: lastHistoryItem.killowatts || 0,

    wattsUsed: lastHistoryItem.wattsUsed || 0,
    wattsStarted: lastHistoryItem.wattsStarted || 0,
    wattsStartedTime: lastHistoryItem.wattsStartedTime || null,
    wattsStartedCharging: null,

    regenWatts: 0,
    availableRegen: 0,
    targetRegenBraking: null,
    targetRegen: null,

    motorWatts: 0,
    rawMotorAmps: null,
    rawMotorVolts: null,
    averageMotorWatts: null,
    averageMotorAmps: null,
    averageMotorVolts: null,

    climateOn: false,
    ventMode: "waiting...",
    fanSpeed: 0,

    outsideTemp: null,

    climateConsumption: 0,
    ACUsage: null,
    alternateClimateUsage: null,
    averageClimateUsage: null,

    actualSOC: lastHistoryItem.actualSOC || 100,
    SOCDifference: 0,
    capacityAH: lastHistoryItem.capacityAH || 0,

    accVolts: lastHistoryItem.accVolts || null,

    wattsPerSOC: lastHistoryItem.wattsPerSOC || null,
    wattsPerSOCWatcher: 0,

    chargingVolts: 0,
    chargingAmps: 0,

    parkingBreakOn: lastHistoryItem.parkingBreakOn || false,


    cruiseControlOn: null,

    isBuckled: null,


    startTime: (new Date()).getTime(),
    endTime: null,

    averageLogs: {},

    historyCreated: function() {
      //clear any averages
      self.startTime = (new Date()).getTime();
      self.endTime = null;
      self.startWatts = self.watts;
      self.averageClimateUsage = 0;
      self.averageMotorAmps = 0;
      self.averageRegen = 0;
      self.averageMotorVolts = 0;
      averageLogs = {};
    },

    getAverage: function(key, value) {
      if(!averageLogs[key]) averageLogs[key] = [];
      averageLogs[key].push(value);
      var averageSum = 0;
      async.forEach(averageLogs[key], function(averagePoint){
        averageSum = averageSum + averagePoint;
      });
      return averageSum / averageLogs[key].length;
    },


   setheadLights: function(splitMsg){//expects array of two length strings
      var byte=splitMsg[1];
     console.log("Parsing byte: " + byte);
      if(byte == "00"){
       self.headLights = false;
       self.fogLights = false;
      } else if(byte == "60"){
       self.headLights = true;
       self.fogLights = false;
      } else if(byte == "68"){
       self.headLights = true;
       self.fogLights = true;
      }
      $rootScope.$broadcast('dataUpdate', self);
    },

   setTurnSignal: function(splitMsg){//expects array of two length strings
      var byte=splitMsg[1];
      if(byte == "06") {
       self.turnSignal = "Off";
      } else if(byte == "26") {
       self.turnSignal = "right";
      } else if(byte == "46") {
       self.turnSignal = "left";
      }
      $rootScope.$broadcast('dataUpdate', self);
    },

   setSOH: function(splitMsg){
     if(splitMsg.length < 7){
       return;
     }
     var previousGIDs = self.GIDs;

      var SOHbyte = splitMsg[1];
     self.SOH = (parseInt(SOHbyte, 16) / 2);
      var GIDByte = splitMsg[5];
     self.GIDs = parseInt(GIDByte, 16);

     var tempByte = splitMsg[0];
     self.batteryTemp = (parseInt(tempByte) * .25);
     if(self.distanceUnits == "M"){
       self.batteryTemp = ((self.batteryTemp * 9) / 5) + 32; //convert to F
     }

     /*
      Calculate the kwh remaining in the battery

      Need to usitilize this calculation when temprature is obtained

      (((281 - 6 Unusable) * 80) * .9705 energy recovery factor) * 0% temp correction = 21.351kWh usable

     */
     var newWatts = self.GIDs * 77.5;
     if(previousGIDs != self.GIDs || newWatts > self.watts + 77.5 || newWatts < self.watts - 77.5){
       self.wattDifference = newWatts - self.watts;
       self.watts = newWatts;
       self.killowatts = self.watts / 1000;
       self.getWattsPerSOC();
     } else if(previousGIDs != self.GIDs){
       self.getWattsPerSOC();
     }

     if(self.wattsStarted == 0 || !self.wattsStartedTime || self.wattsStartedTime < self.startTime - (1000 * 60 * 60 * 12)) {
       self.setWattsWatcher();
     } else {
       self.wattsUsed = self.wattsStarted - self.watts;
     }
     $rootScope.$broadcast('dataUpdate', self);
   },

   setWattsWatcher: function(){
     self.wattsStarted = self.watts;
     self.wattsStartedTime = self.startTime;
     self.wattsStartedCharging = self.isCharging;
     self.wattsStartedODO = self.odometer;
     self.wattsUsed = 0;
     self.distanceTraveled = 0;
   },

   set12vBattery: function(splitMsg) {
     self.accBattVolts = parseInt(splitMsg[3], 16) / 10;
     $rootScope.$broadcast('dataUpdate', self);
   },

   setOdometer: function(splitMsg){
      var ODObyte = splitMsg[1] + splitMsg[2] + splitMsg[3];
     var lastODO = self.odometer;
     self.odometer = parseInt(ODObyte, 16);

     /*if(lastODO < self.odometer && self.distanceWatcher) { //if the rawDistanceTraveled is more than the watcher, it must have reset
       self.distancePerMile = self.rawDistanceTraveled - self.distanceWatcher;
     }*/

     if(lastODO < self.odometer) {
       $localStorage.mileDriven += 1;
       $localStorage.milesDrivenToday += 1;
       var odoAtBeginning = $localStorage.history[self.wattsStartedTime].odometer;
       self.lastODOTime = (new Date()).getTime();
       self.distanceTraveled = self.odometer - odoAtBeginning;
     }
     //$rootScope.$broadcast('dataUpdate', self);
   },

   setSpeed: function(splitMsg) {
      var rawSpeed = parseInt(splitMsg[0] + splitMsg[1], 16);
      var units = splitMsg[4];
      var KMH = rawSpeed / 100;
      if(units == "00") {
        self.speed = KMH + "kmh";
       console.log("Vehicle set to Kilometers");
       self.distanceUnits = "K";
      } else if (units == "20") {
        self.speed = parseInt(KMH * 0.621371) + "mph";
        self.distanceUnits = "M";
       console.log("Vehicle set to Miles")
      }
      var now = (new Date()).getTime()
      if(self.lastSpeedTime){
        var timeDifference = now - self.lastSpeedTime;
        var distanceSinceLastSpeed = parseInt(self.speed) / ((1000 * 60 * 60) / timeDifference);
        self.distanceTraveled += distanceSinceLastSpeed;
      }

      self.lastSpeedTime = now;

      self.averageSpeed = self.getAverage('speed', parseInt(self.speed));

      //$rootScope.$broadcast('dataUpdate', self);
    },

   setTransmission: function(splitMsg) {
      var transmissionByte = splitMsg[0];
      //self.log("Transmission byte: " + transmissionByte);
      if(transmissionByte == "08") {
       self.transmission = "P";
      } else if(transmissionByte == "18") {
       self.transmission = "N";
      } else if(transmissionByte == "20") {
       self.transmission = "D";
      } else if(transmissionByte == "10") {
       self.transmission = "R";
      } else if(transmissionByte == "38") {
       self.transmission = "E";
      }
      //$rootScope.$broadcast('dataUpdate', self);
    },

    setChargeStatus: function(splitMsg){
      var chargeByte = splitMsg[0];
      var currentCharging = self.isCharging;
      if(chargeByte == "FF") {
        self.isCharging = true;
      } else {
        self.isCharging = false;
      }
      if(self.isCharging != currentCharging || self.isCharging !== self.wattsStartedCharging || self.startTime > self.wattsStartedCharging + 16000) {
        setTimeout(function(){
          if(self.isCharging !== currentCharging) {
            self.setWattsWatcher();
          }
        }, 15000);

      }
    },

    setCruiseControl: function(splitMsg){
      var chargeByte = splitMsg[4];

      if(chargeByte == "80") {
        self.cruiseControlOn = true;
      } else {
        self.cruiseControlOn = false;
      }
    },

    setSeatBelts: function(splitMsg){
      var beltByte = splitMsg[0];

      if(beltByte == "03") {
        self.isBuckled = false;
      } else if(beltByte == "01") {
        self.isBuckled = true;
      }
    },

    setParkingBreak: function(splitMsg){
      var PBOn = splitMsg[0];
      if(PBOn == "16") {
        self.parkingBreakOn = true;
      } else {
        self.parkingBreakOn = false;
      }
    },

   setTurnDegrees: function(splitMsg) {
      var degreesHex = splitMsg[0] + splitMsg[1];
     turnAngle = parseInt(degreesHex, 16) / 10;
     //$rootScope.$broadcast('dataUpdate', self);
   },

   setTirePressures: function(splitMsg) {
     self.tire1 = parseInt(splitMsg[2], 16) / 4;
     self.tire2 = parseInt(splitMsg[3], 16) / 4;
     self.tire3 = parseInt(splitMsg[4], 16) / 4;
     self.tire4 = parseInt(splitMsg[5], 16) / 4;

     $rootScope.$broadcast('dataUpdate', self);
   },

   setClimateDataA: function(splitMsg){
     $rootScope.$broadcast('dataUpdate', self);
   },

   setClimateDataB: function(splitMsg){
     var CCOn = splitMsg[0];
     if(CCOn == "01") {
       self.climateOn = false;
     } else if(CCOn == "00") {
       self.climateOn = true;
     }

     var ventMode = splitMsg[2];
     if(ventMode == "88") {
       self.ventMode = "Face";
     } else if(ventMode == "90"){
       self.ventMode = "Face/Feet";
     } else if(ventMode == "98") {
       self.ventMode = "Feet";
     } else if(ventMode == "A0") {
       self.ventMode = "Feet/Def";
     } else if(ventMode == "A8") {
       self.ventMode = "Def";
     } else if(ventMode == "80") {
       self.ventMode = "Off";
     }

     self.fanSpeed = parseInt(splitMsg[4], 16);
     $rootScope.$broadcast('dataUpdate', self);
   },

   setClimateConsumption: function(splitMsg){
     var oldConsumption = self.climateConsumption;
     var consumption = parseInt(splitMsg[3], 16);
     self.climateConsumption = (consumption * .25) * 100;

     var outsideRaw = parseInt(splitMsg[7], 16);
     self.outsideTemp = outsideRaw - 51;
     if(oldConsumption != self.climateConsumption){
       $rootScope.$broadcast('dataUpdate', self);
       $rootScope.$broadcast('dataUpdate:Climate', self);
       self.averageClimateUsage = self.getAverage('climateConsumption', self.climateConsumption);
     }
   },

   parseCellVoltage: function(splitMsg){
     var group = parseInt(splitMsg[0], 16);
     if(splitMsg.length < 7){
       return;
     }
     if(splitMsg[0] == "24"){
       var fullSOC = parseInt(splitMsg[5] + splitMsg[6] + splitMsg[7], 16);
       //console.log("OMG GOT FULL SOC " + fullSOC);
       var previousSOC = self.actualSOC;
       self.actualSOC = fullSOC / 10000;
       if(self.wattsPerSOC) {
         self.wattDifference = (self.actualSOC - previousSOC) * self.wattsPerSOC;
         self.watts = self.watts + self.wattDifference;
         self.killowatts = self.watts / 1000;
         self.wattsUsed = self.wattsStarted - self.watts;
         if(self.wattsUsed < 0) {
           self.isCharging = true;
         }
         self.getWattsPerMinute();
       }
       self.getDistancePerWatt();

       $rootScope.$broadcast('dataUpdate:SOC', self);
     } else if(splitMsg[0] == "25"){
       var AH = parseInt(splitMsg[2] + splitMsg[3] + splitMsg[4], 16);
       self.capacityAH = AH / 10000;
     } else if(splitMsg[0] == "23"){
       var VCC = parseInt(splitMsg[3] + splitMsg[4], 16);
       self.accVolts = VCC / 1024;
     }
     $rootScope.$broadcast('dataUpdate', self);
   },

   getWattsPerSOC: function() {
     var wattsFromGIDs = self.GIDs * 77.5;
     if(wattsFromGIDs != self.wattsPerSOCWatcher && self.GIDs > 0) {
       var wattDifference = Math.abs(self.wattsPerSOCWatcher - self.watts); //Watt difference, should be 77.5, maybe more
       var SOCDifference = Math.abs(self.actualSOC - self.lastSOC);
       //var wattsToSOCRound = wattDifference * (1 / SOCDifference);

       //$rootScope.$broadcast('log', {log: "SOC difference = " + SOCDifference});
       self.wattsPerSOC = wattsFromGIDs / self.actualSOC;
       self.wattsPerSOCWatcher = self.watts;
       self.lastSOC = self.actualSOC;
       self.SOCDifference = SOCDifference;
       //self.wattsPerSOC = self.wattsPerSOC * (1 / SOCDifference);
     } else if(self.actualSOC != 0 && !self.wattsPerSOCWatcher) {
       self.wattsPerSOCWatcher = wattsFromGIDs;
       self.lastSOC = self.actualSOC;
     } else if(self.GIDs == 0 && self.wattsPerSOC){
       //calculate based off of Watts per SOC
       self.watts = self.actualSOC * self.wattsPerSOC;
     }
   },

   getWattsPerMinute: function(){
     var now = (new Date()).getTime();
     var timeDifference = (now - self.startTime);
     var wattDifference = self.watts - self.startWatts;
     var timeToMinutes = (1000 * 60) / timeDifference;
     self.wattsPerMinute = wattDifference * timeToMinutes;
   },

   getDistancePerWatt: function(){
     if(self.distanceTraveled) {
       self.distancePerKW = self.distanceTraveled / (self.wattsUsed / 1000);
       self.wattsPerDistance = self.wattsUsed / self.distanceTraveled;
     }
   },

   parseCarCan: function(splitMsg) {

     var type = splitMsg[3];
     if(type == "10") {
       var amps = parseInt(splitMsg[4] + splitMsg[5], 16) / 16;
       self.chargingAmps = amps;
     }
     if(type == "30") {
       var volts = parseInt(splitMsg[4] + splitMsg[5], 16) / 128;
       self.chargingVolts = volts;
     }

     if(self.chargingAmps && self.chargingVolts){
       self.chargingWatts = self.chargingAmps * self.chargingVolts;
     }

     var currentCharging = self.isCharging;
     var currentWatts = self.watts;

     if(self.chargingVolts > 50 || (self.wattsUsed < 0 && self.wattDifference > 20)){
       self.isCharging = true;
     } else {
       self.isCharging = false;
     }

     if(currentCharging !== self.isCharging && currentWatts == self.watts && self.chargingVolts < 1){
       setTimeout(function(){
         if(self.isCharging !== currentCharging) {
           self.setWattsWatcher();
         }
       }, 15000);
     }

     $rootScope.$broadcast('dataUpdate', self);
   },

   setQCStatus: function(splitMsg){
     self.chargingVolts = parseInt(splitMsg[3], 16);
     self.chargingAmps = parseInt(splitMsg[4], 16);
     if(self.chargingVolts > 10){
       self.isCharging = true;
     } else {
       self.isCharging = false;
     }
     $rootScope.$broadcast('dataUpdate', self);
   },

   setMotorAmps: function(splitMsg){
     var oldAmps = self.rawMotorAmps;
     self.rawMotorAmps = parseInt(splitMsg[2] + splitMsg[3], 16);
     if(self.rawMotorAmps > 40000) {
       self.rawMotorAmps = (0 - 65535) + self.rawMotorAmps;
     }
     self.averageMotorAmps = self.getAverage('motorAmps', self.rawMotorAmps);
     if(self.rawMotorVolts){
       self.motorWatts = ((self.rawMotorAmps / 2) * (self.rawMotorVolts / 20)) / 3.6 / 2;
       self.averageMotorWatts = self.getAverage('motorWatts', self.motorWatts);
     }
     if(oldAmps != self.rawMotorAmps){
       $rootScope.$broadcast('dataUpdate:Motor', self);
       $rootScope.$broadcast('dataUpdate', self);
     }
   },

   setMotorVolts: function(splitMsg){
     var oldVolts = self.rawMotorVolts;
     self.rawMotorVolts = parseInt(splitMsg[2] + splitMsg[3], 16);
     self.averageMotorVolts = self.getAverage('motorVolts', self.rawMotorVolts);
     if(self.rawMotorAmps){
       self.motorWatts = ((self.rawMotorAmps / 2) * (self.rawMotorVolts / 20)) / 3.6 / 3.6; //this shouldn't need /2?
       self.averageMotorWatts = self.getAverage('motorWatts', self.motorWatts);
       if(self.motorWatts < 0) {
         self.averageRegen = self.getAverage('regenWatts', Math.abs(self.motorWatts));
       }
     }
     if(oldVolts != self.rawMotorVolts){
       $rootScope.$broadcast('dataUpdate:Motor', self);
       $rootScope.$broadcast('dataUpdate', self);
     }
     //console.log("Trying to numberize motoramps " + $factories('number')(self.motorAmps));
   },

   setAvailableRegen: function(splitMsg){
     self.availableRegen = parseInt(splitMsg[1], 16);
   },

   setBraking: function(splitMsg) {
     self.targetRegenBraking = parseInt(splitMsg[0] + splitMsg[1], 16);
     self.targetRegen = parseInt(splitMsg[2] + splitMsg[3], 16);
     $rootScope.$broadcast('dataUpdate', self);
   },

   setRegen: function(splitMsg) {
     self.regenWatts = parseInt(splitMsg[1] + splitMsg[2]) * self.rawMotorVolts * 0.00002875;
     self.averageRegen = self.getAverage('regenWatts', self.regenWatts);
     $rootScope.$broadcast('dataUpdate', self);
   },

   setACUsage:function(splitMsg){
     self.ACUsage = parseInt(splitMsg[2], 16) * 50;
     self.alternateClimateUsage = parseInt(splitMsg[5], 16) * 300;
   },

   setDistanceTraveled: function(splitMsg) {
     var newDistanceTraveled = parseInt(splitMsg[6] + splitMsg[7], 16);
     if(newDistanceTraveled > self.rawDistanceTraveled && self.totalRawDistanceTraveled) {
       self.totalRawDistanceTraveled = self.totalRawDistanceTraveled + Math.abs(self.rawDistanceTraveled - newDistanceTraveled);
     } else {
       self.totalRawDistanceTraveled = newDistanceTraveled;
     }
     self.rawDistanceTraveled = newDistanceTraveled;

   }
  }
  return self;
}]);
