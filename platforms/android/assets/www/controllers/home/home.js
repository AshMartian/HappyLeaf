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

      var watchEnv = function(){
        if(window.light && $localStorage.settings.experiance.darkModeAmbient){
          window.light.getLightState(onSuccess);
        }
        if($localStorage.settings.experiance.darkModeHeadlights && !$scope.userOverrideTheme) {
          $scope.showDarkTheme = dataManager.headLights;
          $scope.$digest();
        }
        var now = (new Date()).getTime();
        if(now - connectionManager.lastMessageTime > 5000 && !connectionManager.sendingCommands) {
          $scope.requestSOC();
          //$rootScope.$broadcast('connected', false);
        }
      }

      setInterval(watchEnv, 5000);
      watchEnv();

      $scope.bufferCount = 0;
      var lastResponse = "";
      connectionManager.subscribe("\r", $scope.parseMessages, function(err){
        logManager.log(JSON.stringify(err));
      });

      //$scope.requestSOC();

      setInterval(function(){
        //eventually try all modules
        connectionManager.failedMessages = false;
        $rootScope.$broadcast('failedMessage', false);
      }, 30000);
    }
    connectionManager.failedMessages = false;

    $scope.parseMessages = function(output){
      $scope.lastMessageTime = (new Date()).getTime();
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
      if($scope.renderLog) { //this take the dom to it's knees
        $scope.logOutput = logManager.logText;
      }
    };

    $scope.lastRequestTime = null;
    $scope.requestSOC = function(){
      if(connectionManager.isConnected){
        $scope.lastRequestTime = (new Date()).getTime();
        logManager.log("Connected to " + connectionManager.lastConnected);
        if(dataManager.transmission == "P" && !dataManager.isCharging){ //chech for dtc every 10 minutes
          if(now - flowManager.lastDTCRequest > 600000){
            flowManager.requestDTC(function(err, status){
              $scope.requestSOC();
            });
          } else {
            flowManager.requestParked(function(err, status){
              $scope.requestSOC();
            });
          }
        } else if(dataManager.isCharging) {
          if(dataManager.transmission == "T") dataManager.transmission = "P";
          flowManager.requestCharging(function(err, status){
            $scope.requestSOC();
          });
        } else {
          flowManager.requestDriving(function(err, status){
            $scope.requestSOC();
          });
        }

      } else if(cordova && !cordova.plugins.backgroundMode.isActive()) {
        logManager.log("Connection failed, trying to reconnect");
        var now = new Date();
        connectionManager.reconnect(function(){
          connectionManager.subscribe("\r", $scope.parseMessages, function(err){
            logManager.log(JSON.stringify(err));
          });
          $scope.requestSOC();
        }, function(err) {
          logManager.log("Connection error " + err);
          $scope.requestSOC();
        });
      }
    }


    /*
    $scope.requestCode = function(code, callback) {
      var commandSequence = ["ATSH" + code, "ATFCH" + code, "ATFCSD300000", "30221210", "X"];
      connectionManager.send(commandSequence, callback);
    }*/

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
