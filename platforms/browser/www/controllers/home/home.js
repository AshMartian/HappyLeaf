happyLeaf.controller('HomeController', function($scope, $rootScope, $mdDialog, bluetoothSend, deviceReady, dataManager, connectionManager, storageManager, $localStorage) {
    $scope.deviceready = false;
    $scope.settingsIcon = "settings";


    $scope.leafSVG = null;

    $scope.local = $localStorage;

    $scope.logText = "HappyLeaf Version " + $localStorage.settings.about.version + "\r\n";
    $scope.logIcon = "play_arrow";
    $scope.renderLog = false;
    $scope.logOutput = $scope.logText;
    $scope.wattDisplay = 'perWatt';

    $scope.menuOptions = [{
      title: "Use Watts/" + dataManager.distanceUnits,
      icon: "swap_horiz",
      clicked: function(){
        if($scope.wattDisplay == 'perDistance'){
          this.title = "Use Watts/" + dataManager.distanceUnits;
          $scope.wattDisplay = 'perWatt';
        } else {
          this.title = "Use " + dataManager.distanceUnits + "/kW";
          $scope.wattDisplay = 'perDistance';
        }
      }
    },{
      title: "Reset",
      icon: "cached",
      clicked: function(ev){
        var confirm = $mdDialog.confirm()
         .title('Reset Watt Meter?')
         .textContent('This will reset the current Watt measurement and set the Watt start time to now. Are you sure?')
         .ariaLabel('Lucky day')
         .targetEvent(ev)
         .ok('Yes, reset!')
         .cancel('Nevermind');

         $mdDialog.show(confirm).then(function() {
           dataManager.setWattsWatcher();
         }, function() {

         });
      }
    }, {
      title: "Explain",
      icon: "info",
      clicked: function(ev){
        $mdDialog.show(
          $mdDialog.alert()
            .parent(angular.element(document.querySelector('#home')))
            .clickOutsideToClose(true)
            .title('Watt Meter')
            .textContent('Watts are the measurement of energy transfer, being able to track Watt usage is key to increase efficiency. This widget measures the Watt change from a specified time, and can be reset anytime.')
            .ariaLabel('Alert Dialog Demo')
            .ok('Got it!')
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
          return dataManager[key] ? "Yes": "No";
        } else {
          return dataManager[key];
        }
      }
    }

    $scope.showDarkTheme = false;

    deviceReady(function(){
      storageManager.startupDB();
      sensors.enableSensor("LIGHT");
    });

    $scope.$on('$viewContentLoaded', function(){
      $scope.log("init");
      //$scope.init();
    });
    $scope.$on('$routeChangeSuccess', function(){
      $scope.log("Route Changed");
      $rootScope.$broadcast('dataUpdate', null);
      $scope.init();
    });

    $rootScope.$on('log', function(data){
      $scope.log(data.log);
    });


    $scope.lastMsg = "";
    $scope.messagesReceived = [];

    $scope.init = function(){
      setInterval(function(){
        $scope.log("Setting history point");
        storageManager.createHistoryPoint();
      }, 30000);

      $scope.bufferCount = 0;
      var lastResponse = "";
      bluetoothSerial.subscribe("\r", function(output){
        //$scope.log("this is the output " + output);
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
            $scope.log("Ran into an issue clearing the buffer");
          });
          $scope.log("Clearing all the data in the buffer ");

        } else {
          parse();
        }*/
      }, function(err){
        $scope.log(err);
      });

      /*var commandstoSend = ["ATL0", "ATI", "STI", "ATSP6", "ATH1", "ATS0", "ATCAF0", "ATSH797", "ATFCH797", "ATFCSD300000", "ATFCSM1", "0210C0", "03221304", "03221156", "0322132A", "03221103", "03221183", "03221203", "03221205", "0322124E", "0322115D", "03221261", "03221262", "03221152", "03221151", "03221234", "0322114E", "03221236", "03221255"];
      bluetoothSend.shouldSend();
      bluetoothSend.send(commandstoSend, function(log){
        $scope.log(JSON.stringify(log));
        $scope.$apply();*/
      $scope.requestSOC();
      setInterval(function(){
        //eventually try all modules
        $scope.failedMessages = false;
      }, 60000);

      setInterval(function(){
        $scope.$digest();

        sensors.getState(function(values){
          console.log("Got " + values.length + " ambient light " + values[0]);
          $scope.log("Got " + values.length + " ambient light " + values[0]);
        });
      }, 5000);
    }

    $scope.knownMessages = ["79A", "7BB", "79A", "5B3", "55B", "54A", "260", "280", "284", "292", "1CA", "1DA", "1D4", "355", "002", "551", "5C5", "60D", "385", "358", "100", "108", "180", "1DB", "1CB", "54B", "102", "5C0", "5BF", "421", "54A", "1DC", "103", "625", "510", "1F2", "59B", "59C", "793", "1D5", "176", "58A", "5A9", "551"];
    $scope.failedMessages = false;

    $scope.lastRequestTime = null;
    $scope.requestSOC = function(){
      //console.log("Requesting ALL");
      $scope.bufferCount = 0;
      var commandsToSend = ["ATAR", "ATE0", "ATL0", "ATCAF0", "ATSH797", "ATFCSH797", "ATFCSD300000", "ATFCSM1", "0210C0", "ATSH79B", "ATFCSH79B", "022101", "022104", "ATSH792", "ATFCSH792", "03221210", "03221230", "ATAR"];
      //var commandstoSend = ["ATE0", "ATIB10", "ATL0", "ATCAF0", "ATSP6", "ATH1", "ATS0", "ATCAF0", "ATSH797", "ATFCSH797", "ATFCSD300000", "ATFCSM1", "0210C0", "ATSH79B", "ATFCSH79B", "022101", "022104", "ATCM7FE", "ATCF5B3", "ATMA", "X", "ATCM7FE", "ATCF5BF", "ATMA", "X", "ATCM7FE", "ATCF385", "ATMA", "X", "ATCM7FE", "ATCF5C5", "ATMA", "X", "ATCM7FE", "ATCF421", "ATMA", "X", "ATCM7FE", "ATCF60D", "ATMA", "X", "ATCM7FE", "ATCF510", "ATMA", "X", "ATCRA355", "ATMA", "X", "ATCM7FE", "ATCF625", "ATMA", "X", "ATCM7FE", "ATCF284", "ATMA", "X", "ATCM7FE", "ATCF180", "ATMA", "X", "ATCM7FE", "ATCF176", "ATMA", "X", "ATAR"];
      //var commandstoSend = ["ATE0", "ATH1", "STI", "ATSP6", "ATS0", "ATRV", "ATCAF0", "ATCM7FE", "ATCF60D", "ATMA", "X", "ATCM7FE", "ATCF5B3", "ATMA", "X", "ATCM7FE", "ATCF358", "ATMA", "X", "ATCM7FE", "ATCF421", "ATMA", "X", "ATCM7FE", "ATCF625", "ATMA", "X"];
      //"ATAR", "ATSH797", "ATFCH797", "ATFCSD300000", "0210C0", "03221304", "03221156", "0322132A", "03221103", "03221183", "0322124E", "0322115D", "03221203", "03221205", "0322124E", "0322115D", "03221261", "03221262", "03221152", "03221151", "03221146", "03221255", "03221234", "0322114E", "03221236", "03221255"
      async.each($scope.knownMessages, function(message){
        //commandsToSend.push.apply(commandsToSend, ["ATCRA" + message, "ATCF" + message, "ATMT" + message, "ATMA", "X"]);
      });

      $scope.log("Sending " + commandsToSend.length + " commands");

      if(connectionManager.isConnected){
        $scope.lastRequestTime = (new Date()).getTime();
        $scope.log("Connected to " + connectionManager.lastConnected);
        bluetoothSend.send(commandsToSend, function(log){
          var now = (new Date()).getTime();
          $scope.log("Completed command sequence, took " + (now - $scope.lastRequestTime) + "ms");

          //$scope.requestCode('792', function(){
          if(!$scope.failedMessages){
            $scope.listenForMessages();
          } else {
            $scope.requestSOC();
          }

          //});

        });
      } else {
        $scope.log("Connection failed, trying to reconnect");
        var now = new Date();
        connectionManager.reconnect(function(){
          $scope.requestSOC();
        }, function(err){
          $scope.log("Connection error " + err);
          $scope.requestSOC();
        });
      }

    }

    $scope.listenForMessages = function() {
      if(connectionManager.isConnected && $scope.failedMessages == false) {
        $scope.log("Watching CAN for known messages");
        var commandsToSend = ["ATCF5BB", "ATCRA5BX", "ATMA", "X", "ATAR", "ATCRA", "ATMA", "X", "ATBD", "ATAR", "ATCF54F", "ATCRA5XX", "ATMA", "X", "ATCF62F", "ATCRA6XX", "ATMA", "X", "ATCF38F", "ATCRA38X", "ATMA", "X", "ATAR", "ATCRA", "ATMA", "X", "ATBD", "ATAR"];
        $scope.lastRequestTime = (new Date()).getTime();
        bluetoothSend.shouldSend();
        bluetoothSend.send(commandsToSend, function(log){
          var now = (new Date()).getTime();
          $scope.log("Completed command sequence, took " + (now - $scope.lastRequestTime) + "ms, received " + $scope.messagesReceived.length + " messages, " + bluetoothSend.failedSend.length + " force send requests");
          if(bluetoothSend.failedSend.length > 20 && $scope.messagesReceived.length < 100) {
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
      //$scope.log("Response: " + response);
      response = response.replace(/>/g, '');

      $scope.log("Sent " + request);
      if(response.length >= 3 && response.indexOf("OK") == -1) {
        //console.log(response);
        $scope.log("Parsing " + response.substring(0, 3));
      }

      async.each($scope.knownMessages, function(responseMsg){
        if(response.substring(0, 3) == responseMsg) {
          responseMsg = responseMsg.substring(responseMsg.indexOf(responseMsg));
          var splitResponseMsg = response.split(responseMsg);
          async.each(splitResponseMsg, function(msg){
            if(msg.length > 1){
              //$scope.log("Found " + responseMsg + " message: " + msg);
              $scope.parseMsg(responseMsg, msg);
            }
          });
          //response = response.substring(response.indexOf(responseMsg), 16 + response.indexOf(responseMsg));
          //$scope.log("Parsed response ", response);
        }
      });
      //
        if($scope.renderLog) { //this take the dom to it's knees
          $scope.$apply(function(){
            $scope.logOutput = $scope.logText;
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
          $scope.log("Got 7BB cell voltage  " + msg);
          dataManager.parseCellVoltage(splitMsg);
          $scope.$digest();
          break;
        case "79A":
          $scope.log("Got 79A " + msg);
          dataManager.parseCarCan(splitMsg);
          break;
        case "793":
          $scope.log("Got 793 " + msg);
          dataManager.parseCarCan(splitMsg);
          break;
        case "625":
          $scope.log("Got Headlight status: " + msg);
          dataManager.setheadLights(splitMsg);
          break;
        case "60D":
          $scope.log("Got Turn Signal status: " + msg);
          dataManager.setTurnSignal(splitMsg);
          break;
        case "5B3":
          $scope.log("Got battery SOH: " + msg);
          dataManager.setSOH(splitMsg);
          break;
        case "54F":
          $scope.log("Got Climate Data " + msg);
          self.setACUsage(splitMsg);
          break;
        case "5BF":
          $scope.log("Got charging status?? " + msg);
          break;
        case "002":
          $scope.log("Got turning angle! " + msg);
          dataManager.setTurnDegrees(splitMsg);
          break;
        case "385":
          $scope.log("Got tire pressures " + msg);
          dataManager.setTirePressures(splitMsg);
          break;
        case "355":
          $scope.log("Got Vehicle speed! " + msg);
          dataManager.setSpeed(splitMsg);
          break;
        case "5C5":
          $scope.log("Got ODO! " + msg);
          dataManager.setOdometer(splitMsg);
          break;
        case "55B":
          $scope.log("Got SOC! " + msg);
          break;
        case "100":
          $scope.log("Got battery watts " + msg);
          break;
        case "421":
          $scope.log("Got 'transmission' status " + msg);
          dataManager.setTransmission(splitMsg);
          break;
        case "102":
          $scope.log("Got charging current " + msg);
          break;
        case "108":
          $scope.log("Got available output current " + msg);
          break;
        case "108":
          $scope.log("Got output current " + msg);
          break;
        case "260":
          $scope.log("Got available regen " + msg);
          dataManager.setAvailableRegen(splitMsg);
          break;
        case "5C0":
          $scope.log("Got possible charging/discharging current " + msg);
          break;
        case "180":
          $scope.log("Got motor Amps " + msg);
          bluetoothSend.shouldSend();
          dataManager.setMotorAmps(splitMsg);
          break;
        case "176":
          $scope.log("Got motor Volts " + msg);
          bluetoothSend.shouldSend();
          dataManager.setMotorVolts(splitMsg);
          break;
        case "54B":
          $scope.log("Got Climate data " + msg);
          bluetoothSend.shouldSend();
          dataManager.setClimateDataB(splitMsg);
          break;
        case "1DB":
            $scope.log("Got Battery current " + msg);
          break;
        case "1DC":
            $scope.log("Got Battery KW usage " + msg);
            dataManager.setBatteryWatts(splitMsg);
          break;
        case "284":
            $scope.log("Got distance traveled " + msg);
            //dataManager.setDistanceTraveled(splitMsg);
          break;
        case "510":
            $scope.log("Got climate power usage " + msg);
            dataManager.setClimateConsumption(splitMsg);
          break;
        case "1F2":
            $scope.log("Got charging state " + msg);
          break;
        case "59B":
            $scope.log("Got charging status 1 " + msg);
          break;
        case "59C":
            $scope.log("Got charging status 2 " + msg);
          break;
        case "292":
            $scope.log("Got 12v Battery voltage " + msg);
            dataManager.set12vBattery(splitMsg);
          break;
        case "1D5":
            $scope.log("Got regen braking " + msg);
            dataManager.setRegen(splitMsg);
            //$scope.$apply();
          break;
        case "1CB":
            $scope.log("Got target braking " + msg);
            dataManager.setBraking(splitMsg);
          break;
        case "58A":
            $scope.log("Got Parking Brake " + msg);
            dataManager.setParkingBreak(splitMsg);
          break;
        case "5A9":
            //$scope.log("Got maybe important 5A9 " + msg);
            //dataManager.setChargeStatus(splitMsg);
          break;
        case "551":
            $scope.log("Got Cruise Control " + msg);
            dataManager.setCruiseControl(splitMsg);
          break;
        case "280":
            $scope.log("Got Seat Belts " + msg);
            dataManager.setSeatBelts(splitMsg);
          break;
        case "380":
          $scope.log("Got QC status " + msg);
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
      $scope.$digest();
    };

    $scope.log = function(log) {
      if(typeof arguments == "array"){
        //console.log(arguments.join());
        async.eachSeries(arguments, function(logToAdd){
          $scope.logText = logToAdd + "\r\n" + $scope.logText;
        });
      } else {
        //console.log(log);
        $scope.logText = log + "\r\n" + $scope.logText.substring(0, 30000);
      }
    }
    //$scope.init();
});
