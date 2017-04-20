happyLeaf.controller('HomeController', function($scope, $rootScope, $location, $mdDialog, $translate, bluetoothSend, deviceReady, logManager, flowManager, dataManager, connectionManager, storageManager, $localStorage, $threadRun) {
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

    setTimeout(function(){
      $scope.init();
    }, 1000);

    if($localStorage.lang) $translate.use($localStorage.lang);
    moment.locale($translate.use());

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

    if(!$localStorage.settings.experiance.darkModeAmbient && !$localStorage.settings.experiance.darkModeHeadlights) {
      if($localStorage.settings.experiance.darkMode) {
        $scope.showDarkTheme = $localStorage.settings.experiance.darkMode;
      } else {
        $scope.showDarkTheme = false;
      }
    } else {
      $scope.showDarkTheme = false;
    }

    $scope.showFullscreen = $localStorage.settings.experiance.fullScreen ? $localStorage.settings.experiance.fullScreen : false;
    if($scope.showFullscreen){
      AndroidFullScreen.immersiveMode(function(){

      }, null);
    }
    $scope.showFullscreenDisabled = false;

    $scope.toggleDark = function(){
      $scope.userOverrideTheme = true;
      $localStorage.settings.experiance.darkMode = $scope.showDarkTheme ? false : true;
      $scope.showDarkTheme = $localStorage.settings.experiance.darkMode;
    }

    $scope.toggleFullscreen = function() {
      if(typeof cordova !== 'undefined' && typeof AndroidFullScreen !== 'undefined') {
        AndroidFullScreen.isSupported(function(){
          if(!$scope.showFullscreen){
            AndroidFullScreen.showSystemUI(function(){

            }, null);
            $scope.showFullScreen = true;
          } else {
            AndroidFullScreen.immersiveMode(function(){

            }, null);
            $scope.showFullScreen = false;
          }
        }, function(){
          $scope.showFullscreenDisabled = true;
        });
      } else {
        $scope.showFullscreenDisabled = true;
      }
      //$scope.showFullscreen = $scope.showDarkTheme ? false : true;
    }

    deviceReady(function(){
      //storageManager.startupDB();
      logManager.log("Device ready from home");
      cordova.plugins.backgroundMode.on('disable', function(){
        $scope.requestSOC();
      });

    });

    $scope.$on('$viewContentLoaded', function(){
      logManager.log("init");
      $rootScope.$broadcast('dataUpdate', {refresh: true});
      //$scope.init();
    });
    //$scope.$on('$stateChangeSuccess', function(){ //don't need this?
    logManager.log("Home Controller");
    $scope.freshPage = true;
    //$rootScope.$broadcast('dataUpdate', {refresh: true});


      //$scope.requestSOC();
    //});


    $scope.lastDTCRequest = (new Date()).getTime() - 480000;
    $scope.lastMsg = "";
    $scope.messagesReceived = [];
    $scope.messagesWithoutData = [];
    $scope.platform = $rootScope.platform;

    $scope.cycleDistance = function(){
      $scope.distanceToDisplay ++;
      if($scope.distanceToDisplay > 2 && $localStorage.milesDrivenToday) $scope.distanceToDisplay = 0;
      if($scope.distanceToDisplay > 1 && !$localStorage.milesDrivenToday) $scope.distanceToDisplay = 0;
    }

    $scope.back = function(){
      $location.path("/welcome");
    }

    $scope.init = function(){
      setInterval($scope.cycleDistance, 5000);
      $rootScope.$broadcast('dataUpdate', {refresh: true});
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
        var now = (new Date()).getTime();
        if(now - connectionManager.lastMessageTime > 5000 && !connectionManager.sendingCommands || !connectionManager.isConnected) {
          $scope.requestSOC();
          $rootScope.$broadcast('connected', false);
        }
      }, 5000);

      $scope.bufferCount = 0;
      var lastResponse = "";
      connectionManager.subscribe("\r", function(output){
        //logManager.log("this is the output " + output);
        $scope.lastMessageTime = (new Date()).getTime();
        var parse = function(){

          var lastCommand = connectionManager.lastCommand;
          //if(output.indexOf("?") > -1){
          /*if(false){
            bluetoothSend.resendLast();

          } else {*/
            if(output.indexOf(">") > 0 || output.match(/ok/i)){ //|| lastResponse.substring(0, 3) == output.substring(0, 3)
              connectionManager.shouldSend();
            }
            lastResponse = output;
            if(!output.match(/ok|stopped|no/i)){
              $scope.messagesReceived.push(output);
              dataManager.parseResponse(output, lastCommand);
            }
            if(output.match(/no/i)) {
              $scope.messagesWithoutData.push(lastCommand);
            }
            //connectionManager.shouldSend();
          //}
        }


        parse();
      }, function(err){
        logManager.log(JSON.stringify(err));
      });

      $scope.requestSOC();

      setInterval(function(){
        //eventually try all modules
        connectionManager.failedMessages = false;
        $rootScope.$broadcast('failedMessage', false);
      }, 30000);
    }
    connectionManager.failedMessages = false;

    $scope.lastRequestTime = null;
    $scope.requestSOC = function(){
      if(connectionManager.isConnected){
        $scope.lastRequestTime = (new Date()).getTime();
        logManager.log("Connected to " + connectionManager.lastConnected);
        if(dataManager.transmission == "P"){ //chech for dtc every 10 minutes
          if(now - flowManager.lastDTCRequest > 600000){
            flowManager.requestDTC(function(err, status){
              $scope.requestSOC();
            });
          } else {
            flowManager.requestParked(function(err, status){
              $scope.requestSOC();
            });
          }
        } else {
          flowManager.requestDriving(function(err, status){
            self.requestSOC();
          });
        }

      } else if(cordova && !cordova.plugins.backgroundMode.isActive()) {
        logManager.log("Connection failed, trying to reconnect");
        var now = new Date();
        connectionManager.reconnect(function(){
          $scope.requestSOC();
        }, function(err) {
          logManager.log("Connection error " + err);
          $scope.requestSOC();
        });
      }
    }

    $scope.listenForMessages = function() {
      if(connectionManager.isConnected && connectionManager.failedMessages == false) {
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
          //"ATAR", "ATCRA", "ATMA", "X", "ATBD", "ATAR",
          commandsToSend = ["ATBD", "ATAR", "ATOF0", "ATCF5B3", "ATCRA5BX", "ATMA", "X", "ATCF62F", "ATCRA6XX", "ATMA", "X", "ATCF35F", "ATCRA35X", "ATMA", "X", "ATCF38F", "ATCRA38X", "ATMA", "X", "ATCM7FE", "ATCF5C5", "ATMA", "X", "ATCM", "ATCRA", "ATMA", "X", "ATBD", "ATAR"];
        }
        $scope.lastRequestTime = (new Date()).getTime();
        connectionManager.shouldSend();
        connectionManager.send(commandsToSend, function(log){
          var now = (new Date()).getTime();
          logManager.log("Completed command sequence, took " + (now - $scope.lastRequestTime) + "ms, received " + $scope.messagesReceived.length + " messages, " + connectionManager.failedSend.length + " force send requests " + $scope.messagesWithoutData.length + " messages without data");
          if(connectionManager.failedSend.length >= 20 && $scope.messagesReceived.length < 110) {
            connectionManager.failedMessages = true;
            $rootScope.$broadcast('failedMessage', true);
          } else {
            connectionManager.failedMessages = false;
            $rootScope.$broadcast('failedMessage', false);
          }
          $scope.messagesReceived = [];
          $scope.requestSOC();
        });
      } else {
        $scope.requestSOC();
      }
    }


    /*
    $scope.requestCode = function(code, callback) {
      var commandSequence = ["ATSH" + code, "ATFCH" + code, "ATFCSD300000", "30221210", "X"];
      connectionManager.send(commandSequence, callback);
    }*/
    $scope.$on('log', function(){
      if($scope.renderLog) { //this take the dom to it's knees
        $scope.$apply(function(){
          $scope.logOutput = logManager.logText;
        });
      }
    });

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

    //$scope.init();
});
