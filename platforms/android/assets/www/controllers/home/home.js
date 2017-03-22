happyLeaf.controller('HomeController', function($scope, $rootScope, $mdDialog, $translate, bluetoothSend, deviceReady, logManager, dataManager, connectionManager, storageManager, $localStorage, $threadRun) {
    $scope.deviceready = false;
    $scope.settingsIcon = "settings";


    $scope.leafSVG = null;

    $scope.local = $localStorage;
    $scope.logger = logManager;

    $scope.logIcon = "play_arrow";
    $scope.renderLog = false;
    $scope.logOutput = logManager.logText;
    $scope.wattDisplay = 'perWatt';
    $scope.distanceToDisplay = 0;

    $scope.menuOptions = [{
      title: $translate.instant("HOME.MENUS.USE_WATTS", {units: dataManager.distanceUnits}),
      icon: "swap_horiz",
      clicked: function(){
        if($scope.wattDisplay == 'perDistance'){
          this.title = $translate.instant("HOME.MENUS.USE_WATTS", {units: dataManager.distanceUnits});
          $scope.wattDisplay = 'perWatt';
        } else {
          this.title = $translate.instant("HOME.MENUS.USE_KW", {units: dataManager.distanceUnits});
          $scope.wattDisplay = 'perDistance';
        }
      }
    },{
      title: $translate.instant("HOME.MENUS.RESET"),
      icon: "cached",
      clicked: function(ev){
        var confirm = $mdDialog.confirm()
         .title($translate.instant("HOME.RESET_WARNING.TITLE"))
         .textContent($translate.instant("HOME.RESET_WARNING.CONTENT"))
         .targetEvent(ev)
         .ok($translate.instant("HOME.RESET_WARNING.CONTINUE"))
         .cancel($translate.instant("HOME.RESET_WARNING.NEVERMIND"));

         $mdDialog.show(confirm).then(function() {
           dataManager.setWattsWatcher();
         }, function() {

         });
      }
    }, {
      title: $translate.instant("HOME.MENUS.EXPLAIN"),
      icon: "info",
      clicked: function(ev){
        $mdDialog.show(
          $mdDialog.alert()
            .parent(angular.element(document.querySelector('#home')))
            .clickOutsideToClose(true)
            .title($translate.instant("HOME.EXPLAIN_METER.TITLE"))
            .textContent($translate.instant("HOME.EXPLAIN_METER.CONTENT"))
            .ok($translate.instant("HOME.EXPLAIN_METER.OKAY"))
            .targetEvent(ev)
        );
      }
    }];
    $scope.openMenu = function($mdOpenMenu, ev) {
      $mdOpenMenu.open(ev);
    };

    $scope.bufferCount = 0;

    $scope.data = dataManager;
    $scope.dataKeys = Object.keys(dataManager);
    $scope.dataDisplay = function(val) {
        return typeof val !== 'array' && typeof val !== 'object' && typeof val != 'function' && val !== null && val !== "";
    };
    $scope.renderDisplay = function(key){
      if(dataManager[key] !== null) {
        if(key.match(/time/i)){
          return moment(dataManager[key]).fromNow();
        } else if(typeof dataManager[key] == 'number') {
          return Math.round(dataManager[key] * 100) / 100;
        } else if(typeof dataManager[key] == 'boolean') {
          return dataManager[key] ? $translate.instant('HOME.YES'): $translate.instant('HOME.NO');
        } else {
          return dataManager[key];
        }
      }
    }

    $scope.showDarkTheme = false;

    $scope.toggleDark = function(){
      $scope.userOverrideTheme = true;
      $scope.showDarkTheme = $scope.showDarkTheme ? false : true;
    }

    deviceReady(function(){
      //storageManager.startupDB();

    });

    $scope.$on('$viewContentLoaded', function(){
      logManager.log("init");
      //$scope.init();
    });
    $scope.$on('$routeChangeSuccess', function(){
      logManager.log("Route Changed");
      $rootScope.$broadcast('dataUpdate', null);
      $scope.init();
    });



    $scope.lastMsg = "";
    $scope.messagesReceived = [];

    $scope.cycleDistance = function(){
      $scope.distanceToDisplay ++;
      if($scope.distanceToDisplay > 2 && $localStorage.milesDrivenToday) $scope.distanceToDisplay = 0;
      if($scope.distanceToDisplay > 1 && !$localStorage.milesDrivenToday) $scope.distanceToDisplay = 0;
    }

    $scope.init = function(){
      setInterval($scope.cycleDistance, 5000);

      setInterval(function(){
        logManager.log("Setting history point");
        storageManager.createHistoryPoint();
      }, 30000);

      var onSuccess = function(state) {
        dataManager.lightSensor = state;
        var sensitivity = 10 - $localStorage.settings.experiance.lightSensitivity;
        if(state < sensitivity && !$scope.userOverrideTheme) {
          $scope.showDarkTheme = true;
        } else if(!$scope.userOverrideTheme) {
          $scope.showDarkTheme = false;
        }
        $scope.$digest();
      };

      setInterval(function(){
        if(window.light && $localStorage.settings.experiance.darkModeAmbient){
          window.light.getLightState(onSuccess);
        }
        if($localStorage.settings.experiance.darkModeHeadlights && !$scope.userOverrideTheme) {
          $scope.showDarkTheme = dataManager.headLights;
          $scope.$digest();
        }
      }, 5000);

      $scope.bufferCount = 0;
      var lastResponse = "";
      bluetoothSerial.subscribe("\r", function(output){
        //logManager.log("this is the output " + output);
        var parse = function(){
          var lastCommand = bluetoothSend.lastCommand;
          //if(output.indexOf("?") > -1){
          /*if(false){
            bluetoothSend.resendLast();

          } else {*/
            if(output.indexOf(">") > 0 || output.indexOf("OK") > 0){ //|| lastResponse.substring(0, 3) == output.substring(0, 3)
              bluetoothSend.shouldSend();
            }
            lastResponse = output;
            $scope.messagesReceived.push(output);
            $scope.parseResponse(output, lastCommand);
          //}
        }


        parse();
        /*
        $scope.bufferCount ++;
        if($scope.bufferCount >= 6){
          $scope.bufferCount = 0;
          bluetoothSerial.write('ATBD', function(){

          }, function(){
            logManager.log("Ran into an issue clearing the buffer");
          });
          logManager.log("Clearing all the data in the buffer ");

        } else {
          parse();
        }*/
      }, function(err){
        logManager.log(JSON.stringify(err));
      });

      /*var commandstoSend = ["ATL0", "ATI", "STI", "ATSP6", "ATH1", "ATS0", "ATCAF0", "ATSH797", "ATFCH797", "ATFCSD300000", "ATFCSM1", "0210C0", "03221304", "03221156", "0322132A", "03221103", "03221183", "03221203", "03221205", "0322124E", "0322115D", "03221261", "03221262", "03221152", "03221151", "03221234", "0322114E", "03221236", "03221255"];
      bluetoothSend.shouldSend();
      bluetoothSend.send(commandstoSend, function(log){
        logManager.log(JSON.stringify(log));
        $scope.$apply();*/
      /*$threadRun($scope.requestSOC).then(function (result) {
         // ...
         logManager.log("Thread for SOC ended.");
       }, function (err) {
         // ...
         logManager.log("Thread for SOC errored.");
       });*/
       $scope.requestSOC();

      setInterval(function(){
        //eventually try all modules
        $scope.failedMessages = false;
      }, 60000);

      setInterval(function(){
        $scope.$digest();

        sensors.getState(function(values){
          //console.log("Got " + values.length + " ambient light " + values[0]);
          logManager.log("Got " + values.length + " ambient light " + values[0]);
        });
      }, 5000);
    }

    $scope.knownMessages = ["79A", "763", "765", "7BB", "79A", "5B3", "55B", "54A", "260", "280", "284", "292", "1CA", "1DA", "1D4", "355", "002", "551", "5C5", "60D", "385", "358", "100", "108", "180", "1DB", "1CB", "54B", "54C", "102", "5C0", "5BF", "421", "54A", "1DC", "103", "625", "510", "1F2", "59B", "59C", "793", "1D5", "176", "58A", "5A9", "551"];
    $scope.failedMessages = false;

    $scope.lastRequestTime = null;
    $scope.requestSOC = function(){
      //console.log("Requesting ALL");
      $scope.bufferCount = 0;
      var commandsToSend = ["ATAR", "ATE0", "ATL0", "ATCAF0", "ATSH797", "ATFCSH797", "ATFCSD300000", "ATFCSM1", "0210C0", "ATSH79B", "ATFCSH79B", "022101", "022104", "ATSH743", "ATFCSH743", "ATFCSH743", "ATFCSD300100", "022101", "ATSH745", "ATFCSH745", "ATFCSD300000", "022110", "ATSH792", "ATFCSH792", "03221210", "03221230", "ATAR"];
      //var commandstoSend = ["ATE0", "ATIB10", "ATL0", "ATCAF0", "ATSP6", "ATH1", "ATS0", "ATCAF0", "ATSH797", "ATFCSH797", "ATFCSD300000", "ATFCSM1", "0210C0", "ATSH79B", "ATFCSH79B", "022101", "022104", "ATCM7FE", "ATCF5B3", "ATMA", "X", "ATCM7FE", "ATCF5BF", "ATMA", "X", "ATCM7FE", "ATCF385", "ATMA", "X", "ATCM7FE", "ATCF5C5", "ATMA", "X", "ATCM7FE", "ATCF421", "ATMA", "X", "ATCM7FE", "ATCF60D", "ATMA", "X", "ATCM7FE", "ATCF510", "ATMA", "X", "ATCRA355", "ATMA", "X", "ATCM7FE", "ATCF625", "ATMA", "X", "ATCM7FE", "ATCF284", "ATMA", "X", "ATCM7FE", "ATCF180", "ATMA", "X", "ATCM7FE", "ATCF176", "ATMA", "X", "ATAR"];
      //var commandstoSend = ["ATE0", "ATH1", "STI", "ATSP6", "ATS0", "ATRV", "ATCAF0", "ATCM7FE", "ATCF60D", "ATMA", "X", "ATCM7FE", "ATCF5B3", "ATMA", "X", "ATCM7FE", "ATCF358", "ATMA", "X", "ATCM7FE", "ATCF421", "ATMA", "X", "ATCM7FE", "ATCF625", "ATMA", "X"];
      //"ATAR", "ATSH797", "ATFCH797", "ATFCSD300000", "0210C0", "03221304", "03221156", "0322132A", "03221103", "03221183", "0322124E", "0322115D", "03221203", "03221205", "0322124E", "0322115D", "03221261", "03221262", "03221152", "03221151", "03221146", "03221255", "03221234", "0322114E", "03221236", "03221255"
      async.each($scope.knownMessages, function(message){
        //commandsToSend.push.apply(commandsToSend, ["ATCRA" + message, "ATCF" + message, "ATMT" + message, "ATMA", "X"]);
      });

      logManager.log("Sending " + commandsToSend.length + " commands");

      if(connectionManager.isConnected){
        $scope.lastRequestTime = (new Date()).getTime();
        logManager.log("Connected to " + connectionManager.lastConnected);
        bluetoothSend.send(commandsToSend, function(log){
          var now = (new Date()).getTime();
          logManager.log("Completed command sequence, took " + (now - $scope.lastRequestTime) + "ms");

          //$scope.requestCode('792', function(){
          if(!$scope.failedMessages){
            $scope.listenForMessages();
          } else {
            $scope.requestSOC();
          }

          //});

        });
      } else {
        logManager.log("Connection failed, trying to reconnect");
        var now = new Date();
        connectionManager.reconnect(function(){
          $scope.requestSOC();
        }, function(err){
          logManager.log("Connection error " + err);
          $scope.requestSOC();
        });
      }

    }

    $scope.listenForMessages = function() {
      if(connectionManager.isConnected && $scope.failedMessages == false) {
        var commandsToSend = [];
        if($localStorage.settings.experimental.debugCodes){
          logManager.log("Going to loop over all possible commands!");
          var hexCodes = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "X"];
          async.each(hexCodes, function(code1){
            async.each(hexCodes, function(code2){
              async.each(hexCodes, function(code3){
                var code = code1 + code2 + code3;
                commandsToSend = commandsToSend.concat(["ATCM7FE", "ATCF" + code, "ATCRA" + code, "ATMA", "X"]);
              });
            });
          });
          logManager.log("Generated " + commandsToSend.length + " commads!");
        } else {
          logManager.log("Watching CAN for known messages");
          commandsToSend = ["ATBD", "ATCF5BB", "ATCRA5BX", "ATMA", "X", "ATAR", "ATCRA", "ATMA", "X", "ATBD", "ATAR", "ATCF54F", "ATCRA5XX", "ATMA", "X", "ATCF62F", "ATCRA6XX", "ATMA", "X", "ATCF38F", "ATCRA38X", "ATMA", "X", "ATBD", "ATAR"];
        }
        $scope.lastRequestTime = (new Date()).getTime();
        bluetoothSend.shouldSend();
        bluetoothSend.send(commandsToSend, function(log){
          var now = (new Date()).getTime();
          logManager.log("Completed command sequence, took " + (now - $scope.lastRequestTime) + "ms, received " + $scope.messagesReceived.length + " messages, " + bluetoothSend.failedSend.length + " force send requests");
          if(bluetoothSend.failedSend.length >= 20 && $scope.messagesReceived.length < 100) {
            $scope.failedMessages = true;
          }
          $scope.messagesReceived = [];
          $scope.requestSOC();
        });
      } else {
        $scope.requestSOC();
      }
    }
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

    $scope.parseResponse = function(response, request) {
      //logManager.log("Response: " + response);
      response = response.replace(/>/g, '');

      logManager.log("Sent " + request);
      if(response.length >= 3 && response.indexOf("OK") == -1) {
        //console.log(response);
        logManager.log("Parsing " + response.substring(0, 3));
      }

      async.each($scope.knownMessages, function(responseMsg){
        if(response.substring(0, 3) == responseMsg) {
          responseMsg = responseMsg.substring(responseMsg.indexOf(responseMsg));
          var splitResponseMsg = response.split(responseMsg);
          async.each(splitResponseMsg, function(msg){
            if(msg.length > 1){
              //logManager.log("Found " + responseMsg + " message: " + msg);
              $scope.parseMsg(responseMsg, msg);
            }
          });
          //response = response.substring(response.indexOf(responseMsg), 16 + response.indexOf(responseMsg));
          //logManager.log("Parsed response ", response);
        }
      });
      //
        if($scope.renderLog) { //this take the dom to it's knees
          $scope.$apply(function(){
            $scope.logOutput = logManager.logText;
          });
        }
      //});
    }

    $scope.parseMsg = function(code, msg){
      var splitMsg = msg.match(/.{1,2}/g);
      //console.log(splitMsg);
      $scope.lastMsg = msg;
      switch (code) {
        case "7BB":
          logManager.log("Got 7BB cell voltage  " + msg);
          dataManager.parseCellVoltage(splitMsg);
          $scope.$digest();
          break;
        case "79A":
          logManager.log("Got 79A " + msg);
          dataManager.parseCarCan(splitMsg);
          break;
        case "763":
          logManager.log("Got 763 " + msg);
          //dataManager.parseCarCan(splitMsg);
          break;
        case "765":
          logManager.log("Got 765 " + msg);
          //dataManager.parseCarCan(splitMsg);
          break;
        case "793":
          logManager.log("Got 793 " + msg);
          dataManager.parseCarCan(splitMsg);
          break;
        case "625":
          logManager.log("Got Headlight status: " + msg);
          dataManager.setheadLights(splitMsg);
          bluetoothSend.shouldSend();
          break;
        case "60D":
          logManager.log("Got Turn Signal status: " + msg);
          dataManager.setTurnSignal(splitMsg);
          break;
        case "5B3":
          logManager.log("Got battery SOH: " + msg);
          dataManager.setSOH(splitMsg);
          break;
        case "54F":
          logManager.log("Got Climate Data " + msg);
          self.setACUsage(splitMsg);
          break;
        case "5BF":
          logManager.log("Got charging status?? " + msg);
          break;
        case "002":
          logManager.log("Got turning angle! " + msg);
          dataManager.setTurnDegrees(splitMsg);
          break;
        case "385":
          logManager.log("Got tire pressures " + msg);
          dataManager.setTirePressures(splitMsg);
          break;
        case "355":
          logManager.log("Got Vehicle speed! " + msg);
          dataManager.setSpeed(splitMsg);
          break;
        case "5C5":
          logManager.log("Got ODO! " + msg);
          dataManager.setOdometer(splitMsg);
          break;
        case "55B":
          logManager.log("Got SOC! " + msg);
          break;
        case "100":
          logManager.log("Got battery watts " + msg);
          break;
        case "421":
          logManager.log("Got 'transmission' status " + msg);
          dataManager.setTransmission(splitMsg);
          break;
        case "102":
          logManager.log("Got charging current " + msg);
          break;
        case "108":
          logManager.log("Got available output current " + msg);
          break;
        case "108":
          logManager.log("Got output current " + msg);
          break;
        case "260":
          logManager.log("Got available regen " + msg);
          dataManager.setAvailableRegen(splitMsg);
          break;
        case "5C0":
          logManager.log("Got possible charging/discharging current " + msg);
          break;
        case "180":
          logManager.log("Got motor Amps " + msg);
          bluetoothSend.shouldSend();
          dataManager.setMotorAmps(splitMsg);
          break;
        case "176":
          logManager.log("Got motor Volts " + msg);
          bluetoothSend.shouldSend();
          dataManager.setMotorVolts(splitMsg);
          break;
        case "54B":
          logManager.log("Got Climate data " + msg);
          bluetoothSend.shouldSend();
          dataManager.setClimateDataB(splitMsg);
          break;
        case "1DB":
            logManager.log("Got Battery current " + msg);
          break;
        case "1DC":
            logManager.log("Got Battery KW usage " + msg);
            dataManager.setBatteryWatts(splitMsg);
          break;
        case "284":
            logManager.log("Got distance traveled " + msg);
            //dataManager.setDistanceTraveled(splitMsg);
          break;
        case "510":
            logManager.log("Got climate power usage " + msg);
            dataManager.setClimateConsumption(splitMsg);
          break;
        case "1F2":
            logManager.log("Got charging state " + msg);
          break;
        case "59B":
            logManager.log("Got charging status 1 " + msg);
          break;
        case "59C":
            logManager.log("Got charging status 2 " + msg);
          break;
        case "292":
            logManager.log("Got 12v Battery voltage " + msg);
            dataManager.set12vBattery(splitMsg);
          break;
        case "1D5":
            logManager.log("Got regen braking " + msg);
            dataManager.setRegen(splitMsg);
            //$scope.$apply();
          break;
        case "1CB":
            logManager.log("Got target braking " + msg);
            dataManager.setBraking(splitMsg);
          break;
        case "58A":
            logManager.log("Got Parking Brake " + msg);
            dataManager.setParkingBreak(splitMsg);
          break;
        case "5A9":
            logManager.log("Got maybe important 5A9 " + msg);
            //dataManager.setChargeStatus(splitMsg);
          break;
        case "551":
            logManager.log("Got Cruise Control " + msg);
            dataManager.setCruiseControl(splitMsg);
          break;
        case "54C":
            logManager.log("Got Outside Temp " + msg);
            //dataManager.setCruiseControl(splitMsg);
          break;
        case "35D":
            logManager.log("Got Wiper status, maybe more " + msg);
            //dataManager.setCruiseControl(splitMsg);
          break;
        case "280":
            logManager.log("Got Seat Belts " + msg);
            dataManager.setSeatBelts(splitMsg);
          break;
        case "380":
          logManager.log("Got QC status " + msg);
          dataManager.setQCStatus(splitMsg);
          break;
        default:
          //console.log("Could not find message meaning");
      }
    }

    $scope.requestCode = function(code, callback) {
      var commandSequence = ["ATSH" + code, "ATFCH" + code, "ATFCSD300000", "30221210", "X"];
      bluetoothSend.send(commandSequence, callback);
    }



    $scope.toggleLog = function(){
      if($scope.renderLog){
        $scope.logIcon = "play_arrow";
        $scope.renderLog = false;
      } else {
        $scope.logIcon = "pause";
        $scope.renderLog = true;
      }
      //$scope.$digest();
    };

    /*setTimeout(function(){ //Test notifications
      $rootScope.$broadcast('notification', {
        title: "Hello world",
        time: (new Date()).getTime(),
        seen: false,
        content: "<h1>Check your battery!</h1><b>Text!</b>",
        icon: "adb"
      });
    }, 3000);*/
    //$scope.init();
});
