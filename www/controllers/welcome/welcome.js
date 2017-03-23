happyLeaf.controller('WelcomeController', function($scope, $location, $translate, $rootScope, $localStorage, $mdDialog, deviceReady, bluetoothSend, connectionManager, storageManager, logManager) {
  $scope.ready = false;
  $scope.local = $localStorage;
  if(!$localStorage.settings || !$localStorage.settings.data){
    $localStorage.mileDriven = 0;
    $localStorage.settings = {
      data: {
        graphTimeEnd: 86400000,
        showLatestGraph: false,
      }
    };
  }
  if($localStorage.settings.experiance == null) $localStorage.settings.experiance = {};
  if($localStorage.settings.experiance.displayAllData == null) $localStorage.settings.experiance.displayAllData = true;
  if($localStorage.settings.experiance.darkModeAmbient == null) $localStorage.settings.experiance.darkModeAmbient = true;
  if($localStorage.settings.experiance.lightSensitivity == null) $localStorage.settings.experiance.lightSensitivity = 6;
  if($localStorage.settings.experiance.darkModeHeadlights == null) $localStorage.settings.experiance.darkModeHeadlights = false;

  if($localStorage.settings.notifications == null) $localStorage.settings.notifications = {};
  if($localStorage.settings.notifications.enablePush == null) $localStorage.settings.notifications.enablePush = true;

  if($localStorage.settings.experimental == null) $localStorage.settings.experimental = {};
  if($localStorage.settings.experimental.darkModeAmbient == null) $localStorage.settings.experimental.debugCodes = false;
  if($localStorage.settings.experimental.logOBDFile == null) $localStorage.settings.experimental.logOBDFile = false;
  if($localStorage.settings.experimental.logHistoryFile == null) $localStorage.settings.experimental.logHistoryFile = false;

  $localStorage.settings.about = {
    version: "0.1.8.5"
  };


  $scope.devices = [];
  $scope.scanIcon = "autorenew";
  $scope.scanClass = "";

  $scope.continueIcon = "pan_tool";
  $scope.continueClass = "";
  $scope.hasError = false;


  $scope.canContinue = false;

  $scope.commandSequence = ["ATE1", "ATZ", "ATDP", "STSBR 2000000", "ATSP6", "ATH1", "ATS0", "ATI", "ATE0"];

  $scope.status = $translate.instant('WELCOME.LOADING_TEXT');


  logManager.log("I'm running angular!");



  deviceReady(function(){
    logManager.log("Translating to " + $translate.use());
  	logManager.log("Device is ready!");
    if($localStorage.lang) $translate.use($localStorage.lang);
    moment.locale($translate.use());

  	$scope.ready = true;
    window.plugins.insomnia.keepAwake();
    window.light = cordova.require("cordova-plugin-lightSensor.light");
    logManager.setupFilesystem();
    window.light.enableSensor();
    //storageManager.startupDB();

    setInterval(function(){
      logManager.createLogDirectory(cordova.file.externalRootDirectory, function(){
        logManager.saveHistory();
        logManager.saveLog();
      });
    }, 60000);
    var enableBluetooth = function(){
    	bluetoothSerial.enable(
  	    function() {
  	        logManager.log("Bluetooth is enabled");
            setTimeout(function(){
              $scope.scanDevices();
            }, 1000);
  	    },
  	    function() {
  	      logManager.log("The user did *not* enable Bluetooth");
          $translate('WELCOME.BLUETOOTH_ERROR').then(function (error) {
            var confirm = $mdDialog.alert()
              .parent(angular.element(document.querySelector('#welcome')))
              .clickOutsideToClose(true)
              .title(error.TITLE)
              .textContent(error.CONTENT)
              .ok(error.RETRY);

            $mdDialog.show(confirm).then(function(){
              enableBluetooth();
            });
          });

  	    });
      }
      enableBluetooth();
  });


  $scope.scanDevices = function(){
    logManager.log("scanning...");
    $scope.status = $translate.instant("WELCOME.SCANNING");
    $scope.scanIcon = "settings_backup_restore"
    $scope.scanClass = "start";

    $scope.$watch('connectionManager.availableDevices', function(newDevices){
      logManager.log("Devices changed");
      $scope.$apply(function(){
        $scope.devices = newDevices;
      });

    });

    $scope.$watch('connectionManager.isConnected', function(connected){
      logManager.log("Devices connected " + connected);
    });
    //logManager.log(connectionManager);
    if(connectionManager.isConnected){
      $scope.canContinue = true;
    } else {
      connectionManager.scanDevices(function(results){
        logManager.log("scanned");
        var lastConnected = $localStorage.lastConnected;

        if(lastConnected){
          async.forEach(results, function(scannedDevice){
            if(scannedDevice.address == lastConnected) {
              logManager.log("Found last connected device: " + lastConnected);
              $scope.connectDevice(lastConnected);
            }
          });
        }

        $scope.$apply(function(){
          $scope.status = $translate.instant("WELCOME.FOUND", {length: results.length});
          if(lastConnected) {
            $scope.status += " remembering " + lastConnected;
          }
          $scope.devices = results;
          $scope.scanIcon = "autorenew";
          $scope.scanClass = "";
        });
      }, function(err){
        $scope.status = "Scan failed " + err;
        $scope.scanIcon = "error_outline";
      });
    }

  }

  $scope.shouldReconnect = true;
  $scope.connectDevice = function(deviceAddress){
  	logManager.log("Connecting to: " + deviceAddress);
    $scope.status = $translate.instant('WELCOME.CONNECTING');
    $scope.continueIcon = "settings_bluetooth";
    $scope.continueClass = "blink";

    $localStorage.lastConnected = deviceAddress;

    connectionManager.connectDevice(deviceAddress, function(){
      $scope.status = $translate.instant("WELCOME.isConnected");
      logManager.log("Connected welcome");
      $scope.testDevice();
    }, function(err){
      $scope.hasError = true;
      var lastConnected = localStorageService.get('last_connected');
      if(scannedDevice.address == lastConnected) {
        logManager.log("Found local storage connected device");
        $scope.connectDevice(lastConnected);
      }
      $scope.$apply(function(){
        $scope.status = "Connection Failed " + err;
        $scope.continueIcon = "signal_cellular_connected_no_internet_0_bar";
        $scope.continueClass = "";
        $scope.canContinue = false;
      })
    });
  };

  $scope.testDevice = function() {
    bluetoothSend.shouldSend();
    $scope.status = $translate.instant('WELCOME.TESTING');

    responses = [];

    bluetoothSerial.subscribe(">", function(output){
      logManager.log("Subscribe got:");
      output = output.substring(0, output.length - 1);
      logManager.log(output);
      bluetoothSend.shouldSend();
      responses.push(output);

      if(output.indexOf("ELM") !== -1){
        logManager.log("Success!");
        setTimeout(function(){
          $scope.$apply($scope.continue());
        }, 2000);
        $scope.$apply(function(){
          output = output.substring(output.indexOf("ELM"));
          $scope.status = $translate.instant('WELCOME.SUCCESS', {output: output});
          $scope.canContinue = true;
          $scope.continueIcon = "done";
          $scope.continueClass = "";
        });
      } else if(responses.length > $scope.commandSequence.length) {
        $scope.testDevice();
      } else if(!$scope.canContinue) {
        $scope.$apply(function(){
          $scope.status = "Reading: " + output;
        });
      }
    }, function(err){
      logManager.log(err);
    });


    bluetoothSend.send($scope.commandSequence, function(log){
      logManager.log(JSON.stringify(log));
      setTimeout(function(){
        if(!$scope.canContinue) {
          $scope.testDevice()
        }
      }, 2800);
    });
    logManager.log("Testing..");
  }

  $scope.newMessage = function(date){
    logManager.log("Message received");
    logManager.log(data);
  }

  $scope.substribeFailure = function(data) {
    logManager.log("Subscribe failed :(");
    logManager.log(data);
  }

  $scope.continue = function(){
    if($scope.canContinue || connectionManager.isConnected){
      logManager.log("Going to home");
      $location.path("/home");
    } else if($localStorage.historyCount > 0) {
      var confirm = $mdDialog.alert()
        .parent(angular.element(document.querySelector('#welcome')))
        .clickOutsideToClose(true)
        .title($translate.instant('WELCOME.OFFLINE_WARNING.TITLE'))
        .textContent($translate.instant('WELCOME.OFFLINE_WARNING.CONTENT'))
        .ok($translate.instant('WELCOME.OFFLINE_WARNING.CONTINUE'));
      $mdDialog.show(confirm).then(function(){
        logManager.log("Going to home");
        $location.path("/home");
      });
    }
  }
});
