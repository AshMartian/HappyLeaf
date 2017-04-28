happyLeaf.controller('WelcomeController', function($scope, $location, $translate, $rootScope, $localStorage, $mdDialog, deviceReady, connectionManager, storageManager, logManager, flowManager) {
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
  $rootScope.platform = (navigator.userAgent.match(/iPad/i))  == "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : (navigator.userAgent.match(/BlackBerry/i)) == "BlackBerry" ? "BlackBerry" : "null";
  $scope.platform = $rootScope.platform;

  logManager.log("I'm running angular!");

  if(connectionManager.lastWifi || $rootScope.platform !== "Android"){
    setTimeout(function(){
      if($scope.scanDevices){
        $scope.scanDevices();
      }
    }, 2000);
  }

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


    var enableBluetooth = function(){
    	bluetoothSerial.enable(function() {
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

      enableBluetooth();

  });

  var watchingDevices = null;
  $scope.scanDevices = function(){
    logManager.log("Scanning...");
    $scope.status = $translate.instant("WELCOME.SCANNING");
    $scope.scanIcon = "settings_backup_restore"
    $scope.scanClass = "start";

    if((connectionManager.isConnected && !connectionManager.lastWifi) || $scope.canContinue){
      $scope.continueIcon = "done";
      $scope.continueClass = "";
      return;
    }

    if(typeof WifiWizard !== 'undefined' && $localStorage.settings.wifi.allow) {
      WifiWizard.setWifiEnabled(true, function(){
        WifiWizard.getCurrentSSID(function(currentWifi){
          $scope.currentWifi = currentWifi;
          $scope.$digest();
        });
        WifiWizard.startScan(function(){
          WifiWizard.getScanResults(function(networks){
            logManager.log("Listing wifi networks");
            $scope.wifiNetworks = networks;
            setTimeout(function(){
              connectionManager.scanDevices();
            }, 4000);
            async.forEach(networks, function(network){
              if(network == $localStorage.lastConnectedWifi && $scope.currentWifi !== network){
                $scope.connectWifi(network);
              }
            });
          }, function(){
            logManager.log("Could not get Wifi networks");
          });
        });
      }, function(){
        logManager.log("Could not enable Wifi");
      });
    }

    if(watchingDevices) watchingDevices();
    var stopScanning = setTimeout(function(){
      $scope.scanIcon = "autorenew";
      $scope.scanClass = "";
      $scope.$digest();
    }, 6000);

    watchingDevices = $scope.$watch('connection.availableDevices', function(newDevices){
      logManager.log("Devices changed " + JSON.stringify(connectionManager.availableDevices));
      var lastConnected = $localStorage.lastConnected;

      
      $scope.status = $translate.instant("WELCOME.FOUND", {length: connectionManager.availableDevices.length});

      if((lastConnected.address || lastConnected.uuid) && $scope.shouldReconnect && $scope.retryCount < 3){
        $scope.status += " remembering " + lastConnected.name;
        async.forEach(connectionManager.availableDevices, function(scannedDevice){
          if(scannedDevice.address){
            if(scannedDevice.address == lastConnected.address && scannedDevice.address.match(":") && !connectionManager.isConnected && !connectionManager.lastWifi) {
              logManager.log("Found last connected device: " + lastConnected);
              $scope.connectBluetoothDevice(lastConnected.address);
            } else if(scannedDevice.address == lastConnected.address && scannedDevice.address.match(".")) {
              logManager.log("Found last connected wifi device: " + lastConnected);
              $scope.connectWifiDevice(lastConnected.address);
            }
          } else if(scannedDevice.uuid && scannedDevice.uuid == lastConnected.uuid) {
            $scope.connectBluetoothDevice(lastConnected.uuid)
          }
        });
      }
    });

    //$scope.$watch('connection.isConnected', function(connected){
    if(!connectionManager.isConnected) {
      //$scope.status = $translate.instant('DISCONNECTED');
    } else if($scope.canContinue){
      $scope.continueIcon = "done";
      $scope.continueClass = "";
    }
    logManager.log("Device connected " + connectionManager.isConnected);
    //});
    //logManager.log(connectionManager);
    if(connectionManager.isConnected && $scope.canContinue){
      $scope.$digest();
      setTimeout($scope.continue, 500);
    } else if(!connectionManager.isConnected) {
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

  $scope.connectDevice = function(device) {
    $localStorage.lastConnected = device;
    $scope.canContinue = false;
    $scope.retryCount = 0;
    if($localStorage.lastConnected.address && ($localStorage.lastConnected.address.match(":") || $localStorage.lastConnected.uuid.match("-"))) {
      $scope.connectBluetoothDevice($localStorage.lastConnected.address || $localStorage.lastConnected.uuid);
    } else if($localStorage.lastConnected.address.match(".")) {
      $scope.connectWifiDevice($localStorage.lastConnected.address);
    }
  }

  $scope.shouldReconnect = true;
  $scope.retryCount = 0;
  $scope.connectBluetoothDevice = function(deviceAddress){
  	logManager.log("Connecting to: " + deviceAddress);
    $scope.status = $translate.instant('WELCOME.CONNECTING', {name: deviceAddress});

    $scope.continueIcon = "settings_bluetooth";
    $scope.continueClass = "blink";

    //$localStorage.lastConnected = deviceAddress;

    connectionManager.connectBluetoothDevice(deviceAddress, function(){
      $scope.status = $translate.instant("WELCOME.CONNECTED");
      logManager.log("Connected welcome");
      setTimeout($scope.testDevice, 1500);
    }, function(err){
      if(!connectionManager.isConnected){
        $scope.hasError = true;
        if($scope.retryCount < 3){
          $scope.retryCount ++;
          //setTimeout($scope.scanDevices, 1500);
        }

        $scope.$apply(function(){
          $scope.status = $translate.instant("WELCOME.CONNECTION_FAILED") + ' ' + err;
          $scope.continueIcon = "signal_cellular_connected_no_internet_0_bar";
          $scope.continueClass = "";
          $scope.canContinue = false;
        });
      }
    });
  };

  $scope.connectWifiDevice = function(deviceAddress) {
    $scope.status = $translate.instant("WELCOME.CONNECTED");
    $scope.continueIcon = "wifi";

    logManager.log("Connecting to wifi: " + deviceAddress);
    if(connectionManager.isConnected) {
      $localStorage.lastConnected = deviceAddress;
      $localStorage.lastConnectedWifi = $scope.currentWifi;
      $scope.testDevice();
    }
  };

  $scope.connectWifi = function(SSID){
    $scope.status = $translate.instant("WELCOME.CONNECTING", {name: SSID});
    WifiWizard.connectNetwork(SSID, function(){
      setTimeout(function(){
        $scope.scanDevices();
      }, 5000);

    }, function(){
      $scope.status = $translate.instant("WELCOME.WIFI_ERROR");
    });
  }

  $scope.testDevice = function() {
    if(!$scope.canContinue){
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
          $scope.canContinue = true;
          setTimeout(function(){
            $scope.$apply($scope.continue);
          }, 2000);
          $scope.$apply(function(){
            output = output.substring(output.indexOf("ELM"));
            $scope.status = $translate.instant('WELCOME.SUCCESS', {output: output});
            $scope.continueIcon = "done";
            $scope.continueClass = "";
          });
        } else if(responses.length > $scope.commandSequence.length && !$scope.canContinue) {
          $scope.testDevice();
        } else if(!$scope.canContinue) {
          $scope.$apply(function(){
            $scope.status = "Reading: " + output;
          });
        }
      }, function(err){
        logManager.log(err);
      });


      flowManager.requestConnecting(function(){
        setTimeout(function(){
          if(!$scope.canContinue) {
            $scope.testDevice()
          }
        }, 2000);
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
    $rootScope.needsRefresh = true;
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
