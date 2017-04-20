happyLeaf.factory('dataManager', ['$rootScope', '$localStorage', 'logManager', '$translate', function($rootScope, $localStorage, logManager, $translate){
  if($localStorage.history){
    var lastHistoryKey = Object.keys($localStorage.history)
    var lastHistoryItem = $localStorage.history[lastHistoryKey[lastHistoryKey.length - 1]];
    console.log("Last history item ", lastHistoryItem);
  }

  if(!lastHistoryItem) {
    lastHistoryItem = {};
  }

  var GIDsConfirmed = false;

  var averageLogs = {};

  var self = {

    SOH: lastHistoryItem.SOH || 0,
    GIDs: lastHistoryItem.GIDs || 0,
    batteryTemp: lastHistoryItem.batteryTemp || 0,
    tempOffset: lastHistoryItem.tempOffset || 100,
    isCharging: lastHistoryItem.isCharging || false,
    batteryVolts: lastHistoryItem.batteryVolts || 0,
    headLights: false,
    fogLights: false,
    turnSignal: "Off",
    odometer: lastHistoryItem.odometer || 0,
    distanceUnits: lastHistoryItem.distanceUnits || "M",

    distanceTraveled: lastHistoryItem.distanceTraveled || 0,
    rawDistanceTraveled: lastHistoryItem.rawDistanceTraveled || null,
    calculatedDistanceTraveled: lastHistoryItem.calculatedDistanceTraveled || null,
    distancePerKW: lastHistoryItem.distancePerKW || 0,
    wattsPerDistance: lastHistoryItem.wattsPerDistance || 0,
    transmission:  lastHistoryItem.transmission || "T",

    speed: 0,
    averageSpeed: 0,
    speedLog: [],

    turnAngle: 0,

    watts: lastHistoryItem.watts || 0,
    kilowatts: lastHistoryItem.kilowatts || 0,

    wattsUsed: lastHistoryItem.wattsUsed || 0,
    wattsStarted: lastHistoryItem.wattsStarted || 0,
    wattsStartedTime: lastHistoryItem.wattsStartedTime || null,
    wattsStartedCharging: lastHistoryItem.wattsStartedCharging || null,

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

    climateConsumption: 0,
    ACUsage: null,
    alternateClimateUsage: null,
    averageClimateUsage: null,

    actualSOC: lastHistoryItem.actualSOC || 100,
    hx: lastHistoryItem.hx || 0,
    SOCDifference: 0,
    capacityAH: lastHistoryItem.capacityAH || 0,

    accVolts: lastHistoryItem.accVolts || 0,

    wattsPerSOC: lastHistoryItem.wattsPerSOC || 170,

    tire1: lastHistoryItem.tire1 || 0,
    tire2: lastHistoryItem.tire2 || 0,
    tire3: lastHistoryItem.tire3 || 0,
    tire4: lastHistoryItem.tire4 || 0,
    tireDelta: lastHistoryItem.tireDelta || 0,

    chargingVolts: 0,
    chargingAmps: 0,

    parkingBrakeOn: lastHistoryItem.parkingBrakeOn || false,


    cruiseControlOn: null,

    isBuckled: null,
    ODOUnits: lastHistoryItem.ODOUnits || "M",

    distanceOffset: lastHistoryItem.distanceOffset || 0,


    startTime: (new Date()).getTime(),
    endTime: null,

    historyCreated: function() {
      //clear any averages
      self.startTime = (new Date()).getTime();
      self.endTime = null;
      self.startWatts = self.watts;
      self.averageClimateUsage = 0;
      self.averageMotorAmps = 0;
      self.averageRegen = 0;
      self.averageMotorVolts = 0;
      self.peakMotorWatts = 0;
      averageLogs = {};
    },

    reset: function(){
      self.odometer = 0;
      self.accVolts = 0;
      self.capacityAH = 0;
      self.distanceTraveled = 0;
      self.distancePerKW = 0;
      self.batteryTemp = 0;
      self.GIDs = 0;
      self.SOH = 0;
    },

    readableDistanceUnits: function(){
      if(self.distanceUnits == "M") {
        return "Miles";
      } else {
        return "Km";
      }
    },
    readableTempUnits: function(){
      if(self.distanceUnits == "M") {
        return "F";
      } else {
        return "C";
      }
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
       self.turnSignal = "left";
      } else if(byte == "46") {
       self.turnSignal = "right";
      }
      $rootScope.$broadcast('dataUpdate', self);
    },

   setSOH: function(splitMsg){
     if(splitMsg.length !== 8){
       logManager.log("SOH Message length invalid " + splitMsg.length);
       return;
     } else {
       var previousGIDs = self.GIDs;
       var tempByte = splitMsg[0];
       var previousBatteryTemp = self.batteryTemp;
       var batteryTempC = (parseInt(tempByte, 16) * .25);
       var batteryTempF = ((batteryTempC * 9) / 5) + 32;

       var SOHbyte = splitMsg[1];
       self.SOH = (parseInt(SOHbyte, 16) / 2);
       var GIDByte = splitMsg[5];
       self.GIDs = parseInt(GIDByte, 16);

       //self.tempOffset = Math.abs(((batteryTempF / 70 * 100) / 4));
       var tempDifference = 70 - batteryTempF;
       if(tempDifference > 0) {
         tempDifference = tempDifference / 4;
       } else {
         tempDifference = tempDifference / 8;
       }
       self.tempOffset = 100 - tempDifference;

       var wattsFromGIDs = Math.abs((self.GIDs * 0.775) * self.tempOffset);
       var kWFromGIDs = wattsFromGIDs / 1000;

       //Essentially calculate Kw from SOC and make sure it roughly aligns with GIDs. If it doesn't likley over 255..
       if(self.actualSOC) {
         var kWFromSOC = Math.round((self.actualSOC * 170) / 1000);

         if(kWFromSOC > kWFromGIDs + 3 && self.GIDs < 200) {
           self.GIDs = self.GIDs + 255;
           wattsFromGIDs = (self.GIDs * 0.775) * self.tempOffset;
           kWFromGIDs = wattsFromGIDs / 1000;
         }
         GIDsConfirmed = true;
       }
       logManager.log("GIDs: " +self.GIDs+" Temp: "+batteryTempF+" offset = " + self.tempOffset + " GID watts " + wattsFromGIDs);

       if(self.ODOUnits == "M"){
         self.batteryTemp =  batteryTempF; //convert to F
       } else {
         self.batteryTemp = batteryTempC;
       }

       if(batteryTempC > 46) {
         $rootScope.$broadcast('notification', {
           title: $translate.instant("NOTIFICATIONS.HIGH_BAT_TEMP.TITLE"),
           time: (new Date()).getTime(),
           seen: false,
           content: $translate.instant("NOTIFICATIONS.HIGH_BAT_TEMP.CONTENT", {temp: self.batteryTemp}),
           icon: "whatshot"
         });
       }

       if(batteryTempC < 0) {
         $rootScope.$broadcast('notification', {
           title: $translate.instant("NOTIFICATIONS.LOW_BAT_TEMP.TITLE"),
           time: (new Date()).getTime(),
           seen: false,
           content: $translate.instant("NOTIFICATIONS.LOW_BAT_TEMP.CONTENT", {temp: self.batteryTemp}),
           icon: "ac_unit"
         });
       }

       if(self.isCharging && self.batteryTemp > previousBatteryTemp + 1 && (previousBatteryTemp > 2 || previousBatteryTemp < 2)) {
         $rootScope.$broadcast('notification', {
           title: $translation.instant("NOTIFICATIONS.RAPID_TEMP.TITLE"),
           time: (new Date()).getTime(),
           seen: false,
           content: $translate.instant("NOTIFICATIONS.RAPID_TEMP.CONTENT", {temp: self.batteryTemp, increase: self.batteryTemp - previousBatteryTemp}),
           icon: "whatshot"
         });
       }
       /*
        Calculate the kwh remaining in the battery

        Need to usitilize this calculation when temperature is obtained

        (((281 - 6 Unusable) * 80) * .9705 energy recovery factor) * 0% temp correction = 21.351kWh usable

       */
       if(previousGIDs != self.GIDs || wattsFromGIDs > self.watts + 77.5 || wattsFromGIDs < self.watts - 77.5){
         self.wattDifference = wattsFromGIDs - self.watts;
         self.watts = wattsFromGIDs;
         self.kilowatts = kWFromGIDs;
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
     }
   },

   setWattsWatcher: function(){
     self.wattsStarted = self.watts;
     self.wattsStartedTime = self.startTime;
     self.wattsStartedCharging = self.isCharging;
     self.wattsStartedODO = self.odometer;
     self.wattsUsed = 0;
     self.distanceTraveled = 0;
     $localStorage.currentTripStart = null;
   },

   set12vBattery: function(splitMsg) {
     self.accBattVolts = parseInt(splitMsg[3], 16) / 10;
     $rootScope.$broadcast('dataUpdate', self);

     if(self.accBattVolts < 10.8 && self.accBattVolts > 5) {
       $rootScope.$broadcast('notification', {
         title: $translate.instant("NOTIFICATIONS.LOW_12V.TITLE"),
         time: (new Date()).getTime(),
         seen: false,
         content: $translate.instant("NOTIFICATIONS.LOW_12V.CONTENT", {volts: self.accBattVolts}),
         icon: "battery_20"
       });
     }
   },

   setOdometer: function(splitMsg){
     if(splitMsg.length !== 8){
       logManager.log("Odometer message invalid length " + splitMsg.length);
       return;
     }
      var ODObyte = splitMsg[1] + splitMsg[2] + splitMsg[3];
      var rawUnits = splitMsg[7];
      if(rawUnits == "40") {
        self.distanceUnits = "K";
      }
      var lastODO = self.odometer;

      var newODO = parseInt(ODObyte, 16);
      if(newODO != lastODO){
        self.odometer = newODO;
      }
      if(self.distanceUnits != self.ODOUnits && self.distanceUnits != null && self.ODOUnits !== null) {
        if(self.ODOUnits == "M" && self.distanceUnits == "K") {
          self.odometer = self.odometer * 1.60934;
        }
        if(self.ODOUnits == "K" && self.distanceUnits == "M") {
          self.odometer = self.odometer * 0.621371;
        }
      }

     /*if(lastODO < self.odometer && self.distanceWatcher) { //if the rawDistanceTraveled is more than the watcher, it must have reset
       self.distancePerMile = self.rawDistanceTraveled - self.distanceWatcher;
     }*/

     if(lastODO < self.odometer) {
       $localStorage.mileDriven += 1;
       $localStorage.milesDrivenToday += 1;
       if($localStorage.currentTripStart !== null && $localStorage.currentTripStart.odometer){
         var odoAtBeginning = $localStorage.currentTripStart.odometer - $localStorage.currentTripStart.distanceOffset;
         self.distanceTraveled = self.odometer - odoAtBeginning;
       }

       self.lastODOTime = (new Date()).getTime();
     }
     //$rootScope.$broadcast('dataUpdate', self);
   },

   setSpeed: function(splitMsg) {
     if(splitMsg.length < 7){
       logManager.log("Speed message invalid length");
       return;
     }
      var rawSpeed = parseInt(splitMsg[0] + splitMsg[1], 16);
      var units = splitMsg[4];
      var KMH = rawSpeed / 100;
      var ODOUnits = splitMsg[6];
      if(ODOUnits == "60"){
        self.ODOUnits = "M";
      } else if(ODOUnits == "40") {
        self.ODOUnits = "K";
      }
      if(units == "00") {
        self.speed = KMH + "kmh";
        logManager.log("Vehicle set to Kilometers");
        self.distanceUnits = "K";
     } else if (units == "20") {
        self.speed = parseInt(KMH * 0.621371) + "mph";
        self.distanceUnits = "M";
       //console.log("Vehicle set to Miles")
      }
      var now = (new Date()).getTime()
      if(self.lastSpeedTime){
        var timeDifference = now - self.lastSpeedTime;
        var distanceSinceLastSpeed = parseInt(self.speed) / ((1000 * 60 * 60) / timeDifference);
        self.distanceTraveled += distanceSinceLastSpeed;
        self.distanceOffset = self.distanceTraveled % 1;
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
        if(self.distanceUnits == "M" || self.ODOUnits == "M"){
          self.transmission = "E";
        } else {
          self.transmission = "B";
        }

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
      if(self.isCharging != currentCharging || self.isCharging !== self.wattsStartedCharging || self.startTime > self.wattsStartedCharging + 16000 && parseInt(self.speed) != 0 ) {
        $rootScope.$broadcast('changeCharging');
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

    setParkingBrake: function(splitMsg){
      var PBOn = splitMsg[0];
      if(PBOn == "16") {
        self.parkingBrakeOn = true;
      } else {
        self.parkingBrakeOn = false;
      }
    },

   setTurnDegrees: function(splitMsg) {
      var degreesHex = splitMsg[0] + splitMsg[1];
     turnAngle = parseInt(degreesHex, 16) / 10;
     //$rootScope.$broadcast('dataUpdate', self);
   },

   setTirePressures: function(splitMsg) {
     if(splitMsg.length !== 7){
       logManager.log("Speed message invalid length");
       return;
     }
     self.tire1 = parseInt(splitMsg[2], 16) / 4;
     self.tire2 = parseInt(splitMsg[3], 16) / 4;
     self.tire3 = parseInt(splitMsg[4], 16) / 4;
     self.tire4 = parseInt(splitMsg[5], 16) / 4;
     self.tireHighest = Math.max(self.tire1, self.tire2, self.tire3, self.tire4);
     self.tireLowest = Math.min(self.tire1, self.tire2, self.tire3, self.tire4);
     self.tireDelta = Math.abs(self.tireHighest - self.tireLowest);

     if(self.tireDelta > $localStorage.settings.notifications.tireDeltaThreshold) {
       $rootScope.$broadcast('notification', {
         title: $translate.instant('NOTIFICATIONS.TIRE_DELTA.TITLE', {tire: tire}),
         time: (new Date()).getTime(),
         seen: false,
         content: $translate.instant('NOTIFICATIONS.TIRE_DELTA.CONTENT', {value: self.tireDelta, threshold: $localStorage.settings.notifications.tireLowThreshold}),
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

     if(self.tire1 < $localStorage.settings.notifications.tireLowThreshold && self.tire1 > 5) {
       alertLowTire($translate.instant('NOTIFICATIONS.TIRES.R_FRONT'), self.tire1);
     } else if(self.tire1 > $localStorage.settings.notifications.tireHighThreshold) {
       alertHighTire($translate.instant('NOTIFICATIONS.TIRES.R_FRONT'), self.tire1)
     }
     if(self.tire2 < $localStorage.settings.notifications.tireLowThreshold && self.tire2 > 5) {
       alertLowTire($translate.instant('NOTIFICATIONS.TIRES.L_FRONT'), self.tire2);
     } else if(self.tire2 > $localStorage.settings.notifications.tireHighThreshold) {
       alertHighTire($translate.instant('NOTIFICATIONS.TIRES.L_FRONT'), self.tire2)
     }

     if(self.tire3 < $localStorage.settings.notifications.tireLowThreshold && self.tire3 > 5) {
       alertLowTire($translate.instant('NOTIFICATIONS.TIRES.R_REAR'), self.tire3);
     } else if(self.tire3 > $localStorage.settings.notifications.tireHighThreshold) {
       alertHighTire($translate.instant('NOTIFICATIONS.TIRES.R_REAR'), self.tire3)
     }

     if(self.tire4 < $localStorage.settings.notifications.tireLowThreshold && self.tire4 > 5) {
       alertLowTire($translate.instant('NOTIFICATIONS.TIRES.L_REAR'), self.tire4);
     } else if(self.tire4 > $localStorage.settings.notifications.tireHighThreshold) {
       alertHighTire($translate.instant('NOTIFICATIONS.TIRES.L_REAR'), self.tire4)
     }

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

     self.fanSpeed = parseInt((splitMsg[4], 16)-4)/8;
     $rootScope.$broadcast('dataUpdate', self);
   },

   setClimateConsumption: function(splitMsg){
     if(splitMsg.length !== 8){
       logManager.log("Climate message invalid length");
       return;
     }
     var oldConsumption = self.climateConsumption;
     var consumption = parseInt(splitMsg[3], 16).toString(2);
     consumption = consumption.substring(4, consumption.length);
     var totalConsumption = 0;
     for(var i = 0; i < consumption.length; i++){
       totalConsumption = totalConsumption + parseInt(consumption.charAt(i));
     }
     logManager.log("Climate Usage LSB: " + totalConsumption);
     self.climateConsumption = (totalConsumption * .25) * 1000;

     var outsideRaw = parseInt(splitMsg[7], 16);
     var lastOutsideTemp = self.outsideTemp;
     self.outsideTemp = (outsideRaw - 56);

     if(self.distanceUnits == "K") {
       self.outsideTemp = ((self.outsideTemp - 32) * 5 ) / 9
     }
     if((self.distanceUnits == "M" && self.outsideTemp < 30) || (self.distanceUnits == "K" && self.outsideTemp < 1) && Math.round(lastOutsideTemp) == Math.round(self.outsideTemp)) {
       $rootScope.$broadcast('notification', {
         title: $translate.instant("NOTIFICATIONS.LOW_OUTSIDE_TEMP.TITLE"),
         time: (new Date()).getTime(),
         seen: false,
         content: $translate.instant("NOTIFICATIONS.LOW_OUTSIDE_TEMP.TITLE", {temp: self.outsideTemp}),
         icon: "ac_unit"
       });
     }
     if(oldConsumption != self.climateConsumption){
       $rootScope.$broadcast('dataUpdate', self);
       $rootScope.$broadcast('dataUpdate:Climate', self);
       self.averageClimateUsage = self.getAverage('climateConsumption', self.climateConsumption);
     }
   },

   parseLBCData: function(splitMsg){
     var group = parseInt(splitMsg[0], 16);
     if(splitMsg.length !== 8){
       logManager.log("Cannot parse 7BB, invalid length: " + splitMsg.length);
       return;
     }
     if(splitMsg[0] == "24"){
       self.hx = parseInt(splitMsg[2] + splitMsg[3], 16) / 100;
       if(self.hx < 50 && self.hx !== 0) {
         $rootScope.$broadcast('notification', {
           title: $translate.instant("NOTIFICATIONS.LOW_HX.TITLE"),
           time: (new Date()).getTime(),
           seen: false,
           content: $translation.instant("NOTIFICATIONS.LOW_HX.CONTENT", {hx: self.hx}),
           icon: "battery_alert"
         });
       }
       var fullSOC = parseInt(splitMsg[5] + splitMsg[6] + splitMsg[7], 16);
       //console.log("OMG GOT FULL SOC " + fullSOC);
       var previousSOC = self.actualSOC;
       self.actualSOC = fullSOC / 10000;
       if(self.actualSOC < 20) {
         $rootScope.$broadcast('notification', {
           title: $translation.instant("NOTIFICATIONS.LOW_TRACTION.TITLE"),
           time: (new Date()).getTime(),
           seen: false,
           content: $translation.instant("NOTIFICATIONS.LOW_TRACTION.CONTENT", {SOC: self.SOC}),
           icon: "battery_20"
         });
       }
       if(self.wattsPerSOC) {
         self.wattDifference = (self.actualSOC - previousSOC) * self.wattsPerSOC;
         self.watts = self.watts + self.wattDifference;
         self.kilowatts = self.watts / 1000;
         self.wattsUsed = self.wattsStarted - self.watts;
         if(self.wattsUsed < -400) {
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
       self.batteryVolts = parseInt(splitMsg[1] + splitMsg[2], 16) / 100;
       logManager.log("Got battery volts: " + self.batteryVolts);
       if(self.accVolts < 11 && self.accVolts > 6) {
         $rootScope.$broadcast('notification', {
           title: $translate.instant("NOTIFICATIONS.LOW_12V.TITLE"),
           time: (new Date()).getTime(),
           seen: false,
           content: $translate.instant("NOTIFICATIONS.LOW_12V.TITLE", {volts: self.accVolts}),
           icon: "battery_20"
         });
       }
     }
     $rootScope.$broadcast('dataUpdate', self);
   },

   parseCellVoltage: function(response) {
     logManager.log("parsing cell voltage " + response);
     response = response.replace(/7BB/g, '');
     var splitMsg = response.match(/.{1,2}/g);
     var simpleVoltages = [];
     for(var i = 3; i < (splitMsg.length / 2) - 3; i += 2){
       simpleVoltages.push(parseInt(splitMsg[i - 1] + splitMsg[i], 16));
     }
     console.log(simpleVoltages);
   },

   parseCellTemp: function(response) {
     response = response.replace(/7BB/g, '');
     var splitMsg = response.match(/.{1,2}/g);
   },

   parseCellShunt: function(response) {
     response = response.replace(/7BB/g, '');
     var splitMsg = response.match(/.{1,2}/g);
   },

   getWattsPerSOC: function() {
     var wattsFromGIDs = (self.GIDs * 0.775) * self.tempOffset;
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
     if(self.distanceTraveled && self.wattsUsed > 0 && !self.isCharging && GIDsConfirmed) {
       self.distancePerKW = self.distanceTraveled / (self.wattsUsed / 1000);
       self.wattsPerDistance = self.wattsUsed / self.distanceTraveled;
     }
   },

   parseCarCan: function(splitMsg) {
     if(splitMsg.length !== 8){
       logManager.log("EVSE message invalid length: " + splitMsg.length);
       self.isCharging = false;
       return;
     }
     var type = splitMsg[3];
     if(type == "10") {
       var amps = parseInt(splitMsg[4] + splitMsg[5], 16) / 16;
       if(amps < 150){
         self.chargingAmps = amps;
       }
     }
     if(type == "30") {
       var volts = parseInt(splitMsg[4] + splitMsg[5], 16) / 128;
       self.chargingVolts = volts;
     }

     if(parseInt(self.chargingAmps) && parseInt(self.chargingVolts)){
       self.chargingWatts = parseInt(self.chargingAmps * self.chargingVolts);
     } else {
       self.chargingWatts = 0;
     }

     var currentCharging = self.isCharging;

     if(self.chargingVolts > 50 || (self.wattsUsed < 0 && self.wattsPerMinute > 60)){
       self.isCharging = true;
       if(self.wattsUsed > 0) {
         self.setWattsWatcher();
       }
     } else {
       self.isCharging = false;
     }

     if(currentCharging !== self.isCharging && self.chargingVolts < 1 && parseInt(self.speed) == 0){
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
       self.motorWatts = ((self.rawMotorAmps / 2) * (self.rawMotorVolts / 20)) / 8;
       self.averageMotorWatts = self.getAverage('motorWatts', self.motorWatts);
       if(self.motorWatts > self.peakMotorWatts) self.peakMotorWatts = self.motorWatts;
     } else {
       self.motorWatts = 0;
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
       self.motorWatts = ((self.rawMotorAmps / 2) * (self.rawMotorVolts / 20)) / 8; //this shouldn't need /?
       self.averageMotorWatts = self.getAverage('motorWatts', self.motorWatts);
       if(self.motorWatts > self.peakMotorWatts) self.peakMotorWatts = self.motorWatts;
       if(self.motorWatts < 0) {
         self.averageRegen = self.getAverage('regenWatts', Math.abs(self.motorWatts));
       } else {
         self.motorWatts = 0;
       }
       if(self.motorWatts > 70000) {
         $rootScope.$broadcast('notification', {
           title: $translation.instant('NOTIFICATIONS.HIGH_OUTPUT.TITLE'),
           time: (new Date()).getTime(),
           seen: false,
           content: $translation.instant('NOTIFICATIONS.HIGH_OUTPUT.CONTENT', {watts: self.motorWatts}),
           icon: "show_chart"
         });
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

  }
  return self;
}]);
