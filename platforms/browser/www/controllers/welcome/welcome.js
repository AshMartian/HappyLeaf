happyLeaf.controller('WelcomeController', function($scope, $location, $translate, $rootScope, $localStorage, $mdDialog, deviceReady, connectionManager, storageManager, logManager) {
  $scope.ready = false;
  $scope.local = $localStorage;
  $scope.connection = connectionManager;

  $scope.scanIcon = "autorenew";
  $scope.scanClass = "";

  $scope.continueIcon = "pan_tool";
  $scope.continueClass = "";
  $scope.hasError = false;

  $scope.wifiNetworks = [];
  $scope.currentWifi = "";

  $scope.canContinue = false;

  $scope.commandSequence = ["ATE1", "ATZ", "ATDP", "STSBR 2000000", "ATSP6", "ATH1", "ATS0", "ATI", "ATE0"];

  $scope.status = $translate.instant('WELCOME.LOADING_TEXT');
  $scope.platform = (navigator.userAgent.match(/iPad/i))  == "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : (navigator.userAgent.match(/BlackBerry/i)) == "BlackBerry" ? "BlackBerry" : "null";


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

    cordova.plugins.backgroundMode.enable();
    cordova.plugins.backgroundMode.setDefaults({
        title: "Happy Leaf",
        text: "Running",
        icon: 'icon', // this will look for icon.png in platforms/android/res/drawable|mipmap
        color: "", // hex format like 'F14F4D'
        resume: true,
        hidden: true,
        bigText: "Happy Leaf"
    });

    setInterval(function(){
      if(!cordova.plugins.backgroundMode.isActive()){
        logManager.createLogDirectory(cordova.file.externalRootDirectory, function(){
          logManager.saveHistory();
          logManager.saveLog();
        });
      }
    }, 60000);

    setTimeout(function(){
      $scope.scanDevices();
    }, 1500);

    var enableBluetooth = function(){
    	bluetoothSerial.enable(
  	    function() {
  	        logManager.log("Bluetooth is enabled");
            $scope.scanDevices();
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
      if(!connectionManager.lastWifi){
        enableBluetooth();
      }
  });


  $scope.scanDevices = function(){
    logManager.log("Scanning...");
    $scope.status = $translate.instant("WELCOME.SCANNING");
    $scope.scanIcon = "settings_backup_restore"
    $scope.scanClass = "start";

    if(typeof WifiWizard !== 'undefined') {
      WifiWizard.setWifiEnabled(true, function(){
        WifiWizard.getCurrentSSID(function(currentWifi){
          $scope.currentWifi = currentWifi;
        });
        WifiWizard.startScan(function(){
          WifiWizard.getScanResults(function(networks){
            logManager.log("Listing wifi networks");
            $scope.wifiNetworks = networks;
          }, function(){
            logManager.log("Could not get Wifi networks");
          });
        });
      }, function(){
        logManager.log("Could not enable Wifi");
      });
    }

    $scope.$watch('connection.availableDevices', function(newDevices){
      logManager.log("Devices changed " + JSON.stringify(connectionManager.availableDevices));
      var lastConnected = $localStorage.lastConnected;

      $scope.status = $translate.instant("WELCOME.FOUND", {length: connectionManager.availableDevices.length});

      $scope.scanIcon = "autorenew";
      $scope.scanClass = "";

      if(lastConnected){
        $scope.status += " remembering " + lastConnected;
        async.forEach(connectionManager.availableDevices, function(scannedDevice){
          if(scannedDevice.address == lastConnected && scannedDevice.address.match(":")) {
            logManager.log("Found last connected device: " + lastConnected);
            $scope.connectBluetoothDevice(lastConnected);
          } else if(scannedDevice.address == lastConnected && scannedDevice.address.match(".")) {
            logManager.log("Found last connected wifi device: " + lastConnected);
            $scope.connectWifiDevice(lastConnected);
          }
        });
      }




    });

    $scope.$watch('connection.isConnected', function(connected){
      if(!connectionManager.isConnected) {
        $scope.status = $translate.instant('DISCONNECTED');
      }
      logManager.log("Device connected " + connectionManager.isConnected);
    });
    //logManager.log(connectionManager);
    if(connectionManager.isConnected){
      $scope.$digest();
    } else {
      connectionManager.scanDevices(function(results){
        //Will return either wifi or bluetooth device
        logManager.log("Scanned");
        $scope.$digest();
      }, function(err){
        $scope.status = "Scan failed " + err;
        $scope.scanIcon = "error_outline";
      });
    }
  }

  $scope.connectDevice = function(address) {
    $scope.canContinue = false;
    if(address.match(":")) {
      $scope.connectBluetoothDevice(address);
    } else if(address.match(".")) {
      $scope.connectWifiDevice(address);
    }
  }

  $scope.shouldReconnect = true;
  $scope.connectBluetoothDevice = function(deviceAddress){
  	logManager.log("Connecting to: " + deviceAddress);
    $scope.status = $translate.instant('WELCOME.CONNECTING', {name: deviceAddress});

    $scope.continueIcon = "settings_bluetooth";
    $scope.continueClass = "blink";

    $localStorage.lastConnected = deviceAddress;

    connectionManager.connectBluetoothDevice(deviceAddress, function(){
      $scope.status = $translate.instant("WELCOME.CONNECTED");
      logManager.log("Connected welcome");
      $scope.testDevice();
    }, function(err){
      $scope.hasError = true;
      $scope.$apply(function(){
        $scope.status = "Connection Failed " + err;
        $scope.continueIcon = "signal_cellular_connected_no_internet_0_bar";
        $scope.continueClass = "";
        $scope.canContinue = false;
      });
    });
  };

  $scope.connectWifiDevice = function(deviceAddress) {
    $scope.status = $translate.instant("WELCOME.CONNECTED");
    $scope.continueIcon = "wifi";

    logManager.log("Connecting to wifi: " + deviceAddress);
    if(connectionManager.isConnected) {
      $localStorage.lastConnected = deviceAddress;
      $scope.testDevice();
    }

  };

  $scope.connectWifi = function(SSID){
    $scope.status = $translate.instant("WELCOME.CONNECTING", {name: SSID});
    WifiWizard.connectNetwork(SSID, function(){
      setTimeout(function(){
        $scope.scanDevices();
      }, 8000);

    }, function(){
      $scope.status = $translate.instant("WELCOME.WIFI_ERROR");
    });
  }

  $scope.testDevice = function() {
    logManager.log("Testing device");
    connectionManager.shouldSend();
    $scope.status = $translate.instant('WELCOME.TESTING');

    var responses = [];

    connectionManager.subscribe(">", function(output){
      logManager.log("Subscribe got: " + output);
      output = output.substring(0, output.length - 1);
      connectionManager.shouldSend();
      responses.push(output);

      if(output.indexOf("ELM") !== -1){
        logManager.log("Success!");
        setTimeout(function(){
          $scope.$apply($scope.continue);
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

    if(!$scope.canContinue){
      connectionManager.send($scope.commandSequence, function(log){
        logManager.log(JSON.stringify(log));
        setTimeout(function(){
          if(!$scope.canContinue) {
            $scope.testDevice()
          }
        }, 2800);
      });
      logManager.log("Testing...");
    } else {
      logManager.log("Not testing because already can continue");
    }
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
