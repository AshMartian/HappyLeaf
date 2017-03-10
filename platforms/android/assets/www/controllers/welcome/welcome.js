happyLeaf.controller('WelcomeController', function($scope, $location, $rootScope, $localStorage, deviceReady, bluetoothSend, connectionManager, storageManager) {
  $scope.ready = false;

  if(!$localStorage.settings){
    $localStorage.mileDriven = 0;
    $localStorage.settings = {
      data: {
        graphTimeEnd: 86400000,
        showLatestGraph: false,
      },
      about: {
        version: "0.1.3"
      }
    };
  }

  $scope.devices = [];
  $scope.scanIcon = "autorenew";
  $scope.scanClass = "";

  $scope.continueIcon = "pan_tool";
  $scope.continueClass = "";

  $scope.canContinue = false;

  $scope.commandSequence = ["ATE1", "ATZ", "ATDP", "STSBR 2000000", "ATSP6", "ATH1", "ATS0", "ATI", "ATE0"];

  $scope.status = "Loading...";

  console.log("I'm running angular!");



  deviceReady(function(){
  	console.log("Device is ready!");


  	$scope.ready = true;
    window.plugins.insomnia.keepAwake();
    sensors.enableSensor("LIGHT");

    //storageManager.startupDB();

  	bluetoothSerial.enable(
	    function() {
	        console.log("Bluetooth is enabled");
          setTimeout(function(){
            $scope.scanDevices();
          }, 1000);
	    },
	    function() {
	        console.log("The user did *not* enable Bluetooth");
	    }
		);
  });

  $scope.scanDevices = function(){
    console.log("scanning...");
    $scope.status = "Scanning...";
    $scope.scanIcon = "settings_backup_restore"
    $scope.scanClass = "start";

    $scope.$watch('connectionManager.availableDevices', function(newDevices){
      console.log("Devices changed");
      $scope.$apply(function(){
        $scope.devices = newDevices;
      });

    });

    $scope.$watch('connectionManager.connected', function(connected){
      console.log("Devices connected " + connected);
    });
    console.log(connectionManager);
    connectionManager.scanDevices(function(results){
      console.log("scanned");
      var lastConnected = $localStorage.lastConnected;

      if(lastConnected){
        async.forEach(results, function(scannedDevice){
          if(scannedDevice.address == lastConnected) {
            console.log("Found local storage connected device");
            $scope.connectDevice(lastConnected);
          }
        });
      }

      $scope.$apply(function(){
        $scope.status = "Found " + results.length + " Paired devices";
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

  $scope.shouldReconnect = true;
  $scope.connectDevice = function(deviceAddress){
  	console.log("Connecting to: " + deviceAddress);
    $scope.status = "Connecting..."
    $scope.continueIcon = "settings_bluetooth";
    $scope.continueClass = "blink";

    $localStorage.lastConnected = deviceAddress;

    connectionManager.connectDevice(deviceAddress, function(){
      $scope.status = "Connected!";
      console.log("Connected welcome");
      $scope.testDevice();
    }, function(err){
      var lastConnected = localStorageService.get('last_connected');
      if(scannedDevice.address == lastConnected) {
        console.log("Found local storage connected device");
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
    $scope.status = "Testing..";

    responses = [];

    bluetoothSerial.subscribe(">", function(output){
      console.log("Subscribe got:");
      output = output.substring(0, output.length - 1);
      console.log(output);
      bluetoothSend.shouldSend();
      responses.push(output);

      if(output.indexOf("ELM") !== -1){
        console.log("Success!");
        setTimeout(function(){
          $scope.$apply($scope.continue());
        }, 2000);
        $scope.$apply(function(){
          output = output.substring(output.indexOf("ELM"));
          $scope.status = "Connected to " + output + "!";
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
      console.log(err);
    });


    bluetoothSend.send($scope.commandSequence, function(log){
      console.log(JSON.stringify(log));
      setTimeout(function(){
        if(!$scope.canContinue) {
          $scope.testDevice()
        }
      }, 2800);
    });
    console.log("Testing..");
  }

  $scope.newMessage = function(date){
    console.log("Message received");
    console.log(data);
  }

  $scope.substribeFailure = function(data) {
    console.log("Subscribe failed :(");
    console.log(data);
  }

  $scope.continue = function(){
    console.log("Going to home");
    $location.path("/home");
  }
});
