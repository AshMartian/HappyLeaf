import Ember from 'ember';
import _ from 'lodash';

export default Ember.Service.extend({
  logManager: Ember.inject.service('log-manager'),
  connectionManager: Ember.inject.service('connection-manager'),
  dataManager: Ember.inject.service('data-manager'),
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
    connectionCommands: ["ATE1", "ATZ", "ATDP", "STSBR 2000000", "ATSP6", "ATH1", "ATS0", "ATI", "ATE0"],
  requestConnecting: function(finished) {
    this.set('currentRequest', "connecting");

    this.get('logManager').log("Beginning Connection request");

    this.set('lastRequestTime', (new Date()).getTime());
    //this.set('lastDTCRequest', this.get('lastRequestTime')); //Don't see the point
    this.get('connectionManager').setShouldSend();
    this.get('connectionManager').send(this.get('connectionCommands'), (log) => {
      var now = (new Date()).getTime();
      this.get('logManager').log("Completed Connection command sequence, took " + (now - this.get('lastRequestTime')) + "ms, " + this.get('connectionManager').failedSend.length + " force send requests");
      if(typeof finished == 'function') finished(log);
    });
  },

  requestDriving: function(finished){
    this.set('currentRequest', "driving");
    this.set('commands.getSpeed.priority', 3);
    this.set('commands.getTires.priority', 7);
    this.set('commands.getMotorWatts.priority', 2);
    this.set('commands.getSOH.priority', 4);
    this.set('commands.getOdometer.priority', 5);
    this.set('commands.getHeadlights.priority', 15);
    this.set('commands.getAll.priority', 0);
    this.set('commands.getBatteryCharge.priority', 1);
    this.set('commands.getBatteryVolts.priority', 10);
    this.set('commands.getESVE.priority', 30);
    this.set('commands.getOutsideTemp.priority', 15);
    this.set('commands.getUnknown.priority', 10);
    this.set('commands.getTransmission.priority', 13);
    this.set('commands.getChargeCount.priority', 130);
    this.set('shouldSendATMA', true);
    this.requestMessages(this.get('currentRequest'), finished);
  },

  requestCharging: function(finished){
    this.set('currentRequest', "charging");

    if(this.get('dataManager').carIsOff) {
      this.set('commands.getAll.priority', 40);
      this.set('commands.getSOH.priority', 40);
      this.set('commands.getTires.priority', 50);
      this.set('commands.getSpeed.priority', 60);
      this.set('commands.getMotorWatts.priority', 60);
    } else {
      this.set('commands.getAll.priority', 7);
      this.set('commands.getSOH.priority', 5);
      this.set('commands.getTires.priority', 20);
      this.set('commands.getSpeed.priority', 20);
      this.set('commands.getMotorWatts.priority', 20);
    }

    this.set('commands.getChargeCount.priority', 10);
    this.set('commands.getHeadlights.priority', 10);
    this.set('commands.getOdometer.priority', 45);
    this.set('commands.getBatteryCharge.priority', 1);
    this.set('commands.getBatteryVolts.priority', 2);
    this.set('commands.getESVE.priority', 2);
    this.set('commands.getOutsideTemp.priority', 5);
    this.set('commands.getUnknown.priority', 15);
    this.set('commands.getTransmission.priority', 40);
    this.set('shouldSendATMA', true);
    this.requestMessages(this.get('currentRequest'), finished);
  },

  requestParked: function(finished){
    this.set('currentRequest', "parked");
    this.set('commands.getSpeed.priority', 15);
    this.set('commands.getMotorWatts.priority', 20);
    this.set('commands.getSOH.priority', 5);
    this.set('commands.getHeadlights.priority', 4);
    this.set('commands.getTires.priority', 20);
    this.set('commands.getOdometer.priority', 45);
    this.set('commands.getAll.priority', 3);
    this.set('commands.getBatteryCharge.priority', 1);
    this.set('commands.getBatteryVolts.priority', 5);
    this.set('commands.getESVE.priority', 3);
    this.set('commands.getOutsideTemp.priority', 10);
    this.set('commands.getUnknown.priority', 10);
    this.set('commands.getTransmission.priority', 5);
    this.set('commands.getChargeCount.priority', 10);
    this.set('shouldSendATMA', true);
    this.requestMessages(this.get('currentRequest'), finished);
  },

  requestMessages: function(desiredRequest, finished){
    if(!this.get('connectionManager').isConnected) {
      var err = "Not connected";
      this.get('logManager').log(err);
      return err;
    }
    var atmaCommands = [
      this.get('commands.getSpeed'),
      this.get('commands.getOdometer'),
      this.get('commands.getTransmission'),
      this.get('commands.getSOH'),
      this.get('commands.getAll'),
      this.get('commands.getHeadlights'),
      this.get('commands.getTires'),
      this.get('commands.getOutsideTemp')
    ];
    var atcfCommands = [
      this.get('commands.getBatteryCharge'),
      this.get('commands.getBatteryVolts'),
      this.get('commands.getESVE'),
      this.get('commands.getChargeCount'),
      this.get('commands.getUnknown')
    ];
    atcfCommands = _.sortBy(atcfCommands, 'priority').reverse();
    atmaCommands = _.sortBy(atmaCommands, 'priority').reverse();
    console.log(`About to request ${desiredRequest} messages`, atmaCommands, " and ATCF", atcfCommands);

    let disconnect = new Ember.RSVP.Promise((callback, reject) => {
      if(this.get('currentRequest') !== desiredRequest){
        console.log("Not sending ATCF because not equaled desired request");
        callback('request', null);
      }
      var commandsToSend = ["ATBD", "ATAR", "ATE0", "ATH1", "ATL0", "ATCAF0", "ATFCSM1"];

      this.set('lastRequestTime', (new Date()).getTime());
      this.get('connectionManager').setShouldSend();
      this.get('connectionManager').forceSendTimeout = 80;
      return this.get('connectionManager').send(commandsToSend, (log) => {
        var now = (new Date()).getTime();
        this.get('logManager').log("Completed command sequence, took " + (now - this.get('lastRequestTime')) + "ms, " + this.get('connectionManager').failedSend.length + " force send requests");
        callback(null, log);
      });
    }).then((value) => {
      if(this.get('currentRequest') !== desiredRequest){
        console.log("Not sending ATCF because not equaled desired request");
        callback('request', null);
      }
      console.log('about to loop atcf commands');
      return atcfCommands.reduce((promiseChain, command) => {
          return promiseChain.then(() => new Promise((resolve) => {
            //console.log(command);
            if(typeof command !== 'object') return;
            var now = (new Date()).getTime();
            this.set('lastRequestTime', now);
            var timeDifference = (now - command.lastSent) / 1000;

            if(timeDifference > command.priority || !command.lastSent){
              console.log("Running command " + command.requestName + " time ago " + timeDifference);
              this.set(`commands.${command.requestName}.lastSent`, now);
              //console.log("Testing last sent", this.get(`commands${command.requestName}.lastSent`));
              this.get('connectionManager').forceSendTimeout = command.speed;
              this.get('connectionManager').send(command.codes, (log) => {
                now = (new Date()).getTime();
                this.get('logManager').log("Completed "+command.requestName+" command sequence, took " + (now - this.get('lastRequestTime')) + "ms, " + this.get('connectionManager').failedSend.length + " force send requests");
                resolve(null, log);
              });
            } else {
              console.log("Not sending " + command.requestName + " because already sent within priority time");
              resolve(null); //reject?
            }
          }));
      }, Promise.resolve());
    }).then((previous) => {
      console.log("About to request ATMA commands");
      if(this.get('currentRequest') !== desiredRequest || !this.get('shouldSendATMA')) callback('request', null);

      var commandsToSend = ["ATAR", "ATAR", "ATOF0"];

      this.set('lastRequestTime', (new Date()).getTime());
      this.set('connectionManager.forceSendTimeout', 80);
      return new Ember.RSVP.Promise((callback, reject) => {
        this.get('connectionManager').send(commandsToSend, (log) => {
          var now = (new Date()).getTime();
          this.get('logManager').log("Completed command sequence, took " + (now - this.get('lastRequestTime')) + "ms, " + this.get('connectionManager').failedSend.length + " force send requests");
          callback(previous + log);
        });
      });
    }).then( (previous, callback) => {
      console.log("About to run ATMA");
      if(this.get('currentRequest') !== desiredRequest || !this.get('shouldSendATMA')) callback('request', null);

      return atmaCommands.reduce((promiseChain, command) => {
          return promiseChain.then(() => new Promise((resolve) => {
            if(typeof command !== 'object') next();
            var now = (new Date()).getTime();
            this.set('lastRequestTime', now);
            var timeDifference = (now - command.lastSent) / 1000;
            console.log("Running command " + command.requestName + " time ago " + timeDifference);
            if(timeDifference > command.priority || !command.lastSent){
              this.set(`commands.${command.requestName}.lastSent`, now);
              this.get('connectionManager').forceSendTimeout = command.speed;
              this.get('connectionManager').send(command.codes, (log) => {
                now = (new Date()).getTime();
                if(this.get('connectionManager').failedMessages.length >= command.codes.length - 2){
                  //dataManager.carIsOff = true;
                  //this.set('dataManager.carIsOff', true);
                  this.get('logManager').log("CAR IS OFF!");
                } else {
                  //this.set('dataManager.carIsOff', false);
                  //dataManager.carIsOff = false;
                }
                this.get('logManager').log("Completed "+command.requestName+" command sequence, took " + (now - this.get('lastRequestTime')) + "ms, " + this.get('connectionManager').failedSend.length + " force send requests");
                resolve(null, log);
              });
            } else {
              console.log("Not sending " + command.requestName + " because already sent within priority time");
              resolve(null);
            }
          }));
      }, Promise.resolve());

    }).then(function(status){
      console.log("Completed request messages function");
      //if(err && typeof finished == "function") finished(err, null);
      if(typeof finished == "function") finished(null, status);
    }).catch(function(err){
      console.log("There was an error sending commands ", err);
      finished(err, null);
    });
  },

  requestDTC(finished){
    this.set('currentRequest', "dtc");
    if(this.get('connectionManager').isConnected && this.get('connectionManager').failedMessages == false && dataManager.transmission == "P" && dataManager.parkingBrakeOn) {
      this.get('logManager').log("Beginning DTC request");
      var commandsToSend = ["ATBD",  "ATSH744", "ATFCSH744", "0319020F", "ATSH79B", "ATFCSH79B", "0319020E", "ATSH74D", "ATFCSH74D", "031902FF", "ATSH743", "ATFCSH743", "0319023B", "ATSH784", "ATFCSH784", "0319020B", "ATSH747", "ATFCSH747", "031902FF", "ATSH79D", "ATFCSH79D", "031902FF", "ATSH746", "ATFCSH746", "ATCRA783", "031902FF", "ATAR"];

      this.set('lastRequestTime', (new Date()).getTime());
      this.set('lastDTCRequest', this.get('lastRequestTime'));
      this.get('connectionManager').setShouldSend();
      this.get('connectionManager').send(commandsToSend, (log) => {
        var now = (new Date()).getTime();
        this.get('logManager').log("Completed DTC command sequence, took " + (now - this.lastRequestTime) + "ms, " + this.get('connectionManager').failedSend.length + " force send requests");
        if(typeof finished == 'function') finished();
      });
    } else {
      this.get('logManager').log("Not checking DTC codes for some reason or another");
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
    //async.each(this.knownMessages, function(message){
      //commandsToSend.push.apply(commandsToSend, ["ATCRA" + message, "ATCF" + message, "ATMT" + message, "ATMA", "X"]);
    //});

  }
});
