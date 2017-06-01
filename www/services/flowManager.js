happyLeaf.factory('flowManager', ['$rootScope', '$localStorage', 'logManager', 'connectionManager', '$translate', function($rootScope, $localStorage, logManager, connectionManager, $translate){
  var self = {
    lastRequestTime: null,
    lastDTCRequest: null,
    currentRequest: null,
    requestType: "ATMA", //ATMA/ATCF
    shouldSendATMA: true,
    requestQue: [],
      /*
        Messages based on priority
        {
          codes: ["ATSH", "ATCM7FE"],
          priority: 4, //lower = quicker
          lastSent: date.getTime,
          requestName: 'carcan/battery/'
          requestType: 'ATCF'
        }
      */

    requestConnecting: function(finished) {
      self.currentRequest = "connecting";

      logManager.log("Beginning Connection request");
      var commandsToSend = ["ATE1", "ATZ", "ATDP", "STSBR 2000000", "ATSP6", "ATH1", "ATS0", "ATI", "ATE0"];

      self.lastRequestTime = (new Date()).getTime();
      self.lastDTCRequest = self.lastRequestTime;
      connectionManager.shouldSend();
      connectionManager.send(commandsToSend, function(log){
        var now = (new Date()).getTime();
        logManager.log("Completed Connection command sequence, took " + (now - self.lastRequestTime) + "ms, " + connectionManager.failedSend.length + " force send requests");
        if(typeof finished == 'function') finished(log);
      });
    },

    requestDriving: function(finished){
      self.currentRequest = "driving";
      self.commands.getSpeed.priority = 3;
      self.commands.getTires.priority = 7;
      self.commands.getMotorWatts.priority = 2;
      self.commands.getSOH.priority = 4;
      self.commands.getOdometer.priority = 5;
      self.commands.getHeadlights.priority = 15;
      self.commands.getAll.priority = 0;
      self.commands.getBatteryCharge.priority = 1;
      self.commands.getBatteryVolts.priority = 10;
      self.commands.getESVE.priority = 30;
      self.commands.getOutsideTemp.priority = 15;
      self.commands.getUnknown.priority = 10;
      self.commands.getTransmission.priority = 13;
      self.shouldSendATMA = true;
      self.requestMessages(self.currentRequest, finished);
    },

    requestCharging: function(finished){
      self.currentRequest = "charging";

      self.commands.getHeadlights.priority = 10;
      /*if(dataManager.carIsOff) {
        self.commands.getAll.priority = 40;
        self.commands.getSOH.priority = 40;
        self.commands.getTires.priority = 50;
        self.commands.getSpeed.priority = 60;
        self.commands.getMotorWatts.priority = 60;
      } else {*/
        self.commands.getAll.priority = 7;
        self.commands.getSOH.priority = 5;
        self.commands.getTires.priority = 20;
        self.commands.getSpeed.priority = 20;
        self.commands.getMotorWatts.priority = 20;
      //}
      self.commands.getOdometer.priority = 45;
      self.commands.getBatteryCharge.priority = 1;
      self.commands.getBatteryVolts.priority = 2;
      self.commands.getESVE.priority = 2;
      self.commands.getOutsideTemp.priority = 5;
      self.commands.getUnknown.priority = 15;
      self.commands.getTransmission.priority = 40;
      self.shouldSendATMA = true;
      self.requestMessages(self.currentRequest, finished);
    },

    requestParked: function(finished){
      self.currentRequest = "parked";
      self.commands.getSpeed.priority = 15;
      self.commands.getMotorWatts.priority = 20;
      self.commands.getSOH.priority = 5;
      self.commands.getHeadlights.priority = 4;
      self.commands.getTires.priority = 20;
      self.commands.getOdometer.priority = 45;
      self.commands.getAll.priority = 3;
      self.commands.getBatteryCharge.priority = 1;
      self.commands.getBatteryVolts.priority = 5;
      self.commands.getESVE.priority = 3;
      self.commands.getOutsideTemp.priority = 10;
      self.commands.getUnknown.priority = 10;
      self.commands.getTransmission.priority = 5;
      self.shouldSendATMA = true;
      self.requestMessages(self.currentRequest, finished);
    },

    requestMessages: function(desiredRequest, finished){
      var atmaCommands = [self.commands.getSpeed, self.commands.getOdometer, self.commands.getTransmission, self.commands.getSOH, self.commands.getAll, self.commands.getHeadlights, self.commands.getTires, self.commands.getOutsideTemp];
      var atcfCommands = [self.commands.getBatteryCharge, self.commands.getBatteryVolts, self.commands.getESVE, self.commands.getUnknown];
      atcfCommands = _.sortBy(atcfCommands, 'priority').reverse();
      atmaCommands = _.sortBy(atmaCommands, 'priority').reverse();
      console.log("About to request messages", atmaCommands, " and ATCF", atcfCommands);

      async.waterfall([function(callback){
        if(self.currentRequest !== desiredRequest){
          console.log("Not sending ATCF because not equaled desired request");
          callback('request', null);
        }
        var commandsToSend = ["ATBD", "ATAR", "ATE0", "ATH1", "ATL0", "ATCAF0", "ATFCSM1"];

        self.lastRequestTime = (new Date()).getTime();
        connectionManager.shouldSend();
        connectionManager.forceSendTimeout = 80;
        connectionManager.send(commandsToSend, function(log){
          var now = (new Date()).getTime();
          logManager.log("Completed command sequence, took " + (now - self.lastRequestTime) + "ms, " + connectionManager.failedSend.length + " force send requests");
          callback(null, log);
        });
      }, function(previous, callback) {
        if(self.currentRequest !== desiredRequest){
          console.log("Not sending ATCF because not equaled desired request");
          callback('request', null);
        }
        //console.log('about to loop atcf commands');
        async.eachSeries(atcfCommands, function(command, next){
          if(typeof command !== 'object') next();
          var now = (new Date()).getTime();
          self.lastRequestTime = now;
          var timeDifference = (now - command.lastSent) / 1000;
          //console.log("Running command " + command.requestName + " time ago " + timeDifference);
          if(timeDifference > command.priority || !command.lastSent){
            self.commands[command.requestName].lastSent = now;
            connectionManager.forceSendTimeout = command.speed;
            connectionManager.send(command.codes, function(log){
              now = (new Date()).getTime();
              logManager.log("Completed "+command.requestName+" command sequence, took " + (now - self.lastRequestTime) + "ms, " + connectionManager.failedSend.length + " force send requests");
              next();
            });
          } else {
            console.log("Not sending " + command.requestName + " because already sent within priority time");
            next();
          }
        }, function(err, log) {
          console.log("Done sending ATCF");
          callback(err, log);
        });
      }, function(previous, callback){
        //console.log("About to request ATMA commands");
        if(self.currentRequest !== desiredRequest || !self.shouldSendATMA) callback('request', null);

        var commandsToSend = ["ATAR", "ATAR", "ATOF0"];

        self.lastRequestTime = (new Date()).getTime();
        connectionManager.forceSendTimeout = 80;
        connectionManager.send(commandsToSend, function(log){
          var now = (new Date()).getTime();
          logManager.log("Completed command sequence, took " + (now - self.lastRequestTime) + "ms, " + connectionManager.failedSend.length + " force send requests");
          callback(null, log);
        });
      }, function(previous, callback){
        if(self.currentRequest !== desiredRequest || !self.shouldSendATMA) callback('request', null);

        async.eachSeries(atmaCommands, function(command, next){
          if(typeof command !== 'object') next();
          var now = (new Date()).getTime();
          self.lastRequestTime = now;
          var timeDifference = (now - command.lastSent) / 1000;
          //console.log("Running command " + command.requestName + " time ago " + timeDifference);
          if(timeDifference > command.priority || !command.lastSent){
            self.commands[command.requestName].lastSent = now;
            connectionManager.forceSendTimeout = command.speed;
            connectionManager.send(command.codes, function(log){
              now = (new Date()).getTime();
              if(connectionManager.failedMessages.length >= command.codes.length - 2){
                //dataManager.carIsOff = true;
                logManager.log("CAR IS OFF!");
              } else {
                //dataManager.carIsOff = false;
              }
              logManager.log("Completed "+command.requestName+" command sequence, took " + (now - self.lastRequestTime) + "ms, " + connectionManager.failedSend.length + " force send requests");
              next();
            });
          } else {
            console.log("Not sending " + command.requestName + " because already sent within priority time");
            next();
          }
        }, function(err, data){
          console.log("Done sending ATMA");
          callback(err, data);
        });
      }], function(err, status){
        console.log("Completed request messages function");
        if(err && finished) finished(err, null);
        if(!err && finished) finished(null, status);
      });
    },

    requestDTC: function(finished){
      self.currentRequest = "dtc";
      if(connectionManager.isConnected && connectionManager.failedMessages == false && dataManager.transmission == "P" && dataManager.parkingBrakeOn) {
        logManager.log("Beginning DTC request");
        var commandsToSend = ["ATBD",  "ATSH744", "ATFCSH744", "0319020F", "ATSH79B", "ATFCSH79B", "0319020E", "ATSH74D", "ATFCSH74D", "031902FF", "ATSH743", "ATFCSH743", "0319023B", "ATSH784", "ATFCSH784", "0319020B", "ATSH747", "ATFCSH747", "031902FF", "ATSH79D", "ATFCSH79D", "031902FF", "ATSH746", "ATFCSH746", "ATCRA783", "031902FF", "ATAR"];

        self.lastRequestTime = (new Date()).getTime();
        self.lastDTCRequest = self.lastRequestTime;
        connectionManager.shouldSend();
        connectionManager.send(commandsToSend, function(log){
          var now = (new Date()).getTime();
          logManager.log("Completed DTC command sequence, took " + (now - self.lastRequestTime) + "ms, " + connectionManager.failedSend.length + " force send requests");
          if(typeof finished == 'function') finished();
        });
      } else {
        logManager.log("Not checking DTC codes for some reason or another");
        if(typeof finished == 'function') finished(false);
      }
    },

    commands: {
      //atcf commands
      getSOH:{
        codes: ["ATCF5B3", "ATCRA5BX", "ATMA", "X"],
        priority: 5, //Time in seconds before must request
        speed: 250, //Speed where data is
        lastSent: null, //store when last sent
        requestName: 'getSOH' //needs to match key
      },
      getOdometer: {
        codes: ["ATCM7FE", "ATCF5C5", "ATMA", "X"],
        priority: 20,
        speed: 2,
        lastSent: null,
        requestName: 'getOdometer'
      },
      getTransmission: {
        codes: ["ATCM7FE", "ATCF421", "ATMA", "X"],
        priority: 20,
        speed: 2,
        lastSent: null,
        requestName: 'getTransmission'
      },
      getMotorWatts: {
        codes: ["ATCM7FE", "ATCF180", "ATMA", "X\r", "ATCM7FE", "ATCF176", "ATMA", "X\r", "ATBD"],
        priority: 2,
        speed: 5,
        lastSent: null,
        requestName: 'getMotorWatts'
      },
      getTires: {
        codes: ["ATCF38F", "ATCRA38X", "ATMA", "X"],
        priority: 8,
        speed: 10,
        lastSent: null,
        requestName: 'getTires'
      },
      getSpeed: {
        codes: ["ATCF35F", "ATCRA35X", "ATMA", "X"],
        priority: 3,
        speed: 10,
        lastSent: null,
        requestName: 'getSpeed'
      },
      getHeadlights: {
        codes: ["ATCF62F", "ATCRA62X", "ATMA", "X"],
        priority: 20,
        speed: 10,
        lastSent: null,
        requestName: 'getHeadlights'
      },
      getOutsideTemp: {
        codes: ["ATCF510", "ATCRA510", "ATMA", "X"],
        priority: 25,
        speed: 100,
        lastSent: null,
        requestName: 'getOutsideTemp'
      },
      getAll: {
        codes: ["ATAR", "ATCM", "ATCM", "ATCRA", "ATMA", "ATBD"],
        priority: 10,
        speed: 30,
        lastSent: null,
        requestName: 'getAll'
      },


      //atma commands

      getBatteryCharge: {
        codes: ["ATSH79B", "ATFCSH79B", "022101"],
        priority: 2,
        speed: 100,
        lastSent: null,
        requestName: 'getBatteryCharge'
      },

      getBatteryVolts: {
        codes: ["ATSH79B", "ATFCSH79B", "022104", "022106", "022102"],
        priority: 30,
        speed: 100,
        lastSent: null,
        requestName: 'getBatteryVolts'
      },

      getESVE: {
        codes: ["ATSH792", "ATFCSH792", "03221210", "03221230"],
        priority: 10,
        speed: 100,
        lastSent: null,
        requestName: 'getESVE'
      },

      getChargeCount: {
        codes: ["ATSH797", "ATFCSH797", "03221203", "03221205"],
        priority: 10,
        speed: 100,
        lastSent: null,
        requestName: 'getChargeCount'
      },

      getAlternateTires: {
        codes: ["ATSH745", "ATFCSH745", "022110", "030018"],
        priority: 8,
        speed: 10,
        lastSent: null,
        requestName: 'getAlternateTires'
      },

      getUnknown: {
        codes: ["ATSH743", "ATFCSH743", "ATFCSH743", "ATFCSD300100", "022101", "ATSH745", "ATFCSH745", "ATFCSD300000", "022110"],
        priority: 25,
        speed: 100,
        lastSent: null,
        requestName: 'getUnknown'
      }

      //Old commands.
      //old ATMA commandsToSend = ["ATBD", "ATAR", "ATOF0", "ATCF5B3", "ATCRA5BX", "ATMA", "X", "ATCF62F", "ATCRA6XX", "ATMA", "X", "ATCF35F", "ATCRA35X", "ATMA", "X", "ATCF38F", "ATCRA38X", "ATMA", "X", "ATCM7FE", "ATCF5C5", "ATMA", "X", "ATCM", "ATCRA", "ATMA", "X", "ATBD", "ATAR"];
      //var commandsToSend = ["ATAR", "ATE0", "ATH1", "ATL0", "ATCAF0", "ATFCSM1", "ATSH79B", "ATFCSH79B", "022101", "022104", "022106", "022102", "ATSH743", "ATFCSH743", "ATFCSH743", "ATFCSD300100", "022101", "ATSH745", "ATFCSH745", "ATFCSD300000", "022110", "ATSH792", "ATFCSH792", "03221210", "03221230", "ATSH797", "ATFCSH797", "0210C0", "03221304", "03221156", "ATAR"];
      //var commandstoSend = ["ATE0", "ATIB10", "ATL0", "ATCAF0", "ATSP6", "ATH1", "ATS0", "ATCAF0", "ATSH797", "ATFCSH797", "ATFCSD300000", "ATFCSM1", "0210C0", "ATSH79B", "ATFCSH79B", "022101", "022104", "ATCM7FE", "ATCF5B3", "ATMA", "X", "ATCM7FE", "ATCF5BF", "ATMA", "X", "ATCM7FE", "ATCF385", "ATMA", "X", "ATCM7FE", "ATCF5C5", "ATMA", "X", "ATCM7FE", "ATCF421", "ATMA", "X", "ATCM7FE", "ATCF60D", "ATMA", "X", "ATCM7FE", "ATCF510", "ATMA", "X", "ATCRA355", "ATMA", "X", "ATCM7FE", "ATCF625", "ATMA", "X", "ATCM7FE", "ATCF284", "ATMA", "X", "ATCM7FE", "ATCF180", "ATMA", "X", "ATCM7FE", "ATCF176", "ATMA", "X", "ATAR"];
      //var commandstoSend = ["ATE0", "ATH1", "STI", "ATSP6", "ATS0", "ATRV", "ATCAF0", "ATCM7FE", "ATCF60D", "ATMA", "X", "ATCM7FE", "ATCF5B3", "ATMA", "X", "ATCM7FE", "ATCF358", "ATMA", "X", "ATCM7FE", "ATCF421", "ATMA", "X", "ATCM7FE", "ATCF625", "ATMA", "X"];
      //"ATAR", "ATSH797", "ATFCH797", "ATFCSD300000", "0210C0", "03221304", "03221156", "0322132A", "03221103", "03221183", "0322124E", "0322115D", "03221203", "03221205", "0322124E", "0322115D", "03221261", "03221262", "03221152", "03221151", "03221146", "03221255", "03221234", "0322114E", "03221236", "03221255"
      //async.each(self.knownMessages, function(message){
        //commandsToSend.push.apply(commandsToSend, ["ATCRA" + message, "ATCF" + message, "ATMT" + message, "ATMA", "X"]);
      //});

    }
  };

  return self;
}]);
