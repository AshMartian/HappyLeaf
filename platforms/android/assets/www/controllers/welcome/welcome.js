happyLeaf.controller('WelcomeController', function($scope, $rootScope, deviceReady, bluetoothScan, bluetoothSend) {
  $scope.ready = false;

  $scope.devices = [];
  $scope.scanIcon = "autorenew";
  $scope.scanClass = "";

  $scope.continueIcon = "pan_tool";
  $scope.continueClass = "";

  $scope.canContinue = false;

  $scope.status = "Loading...";

  console.log("I'm running angular!");

  deviceReady(function(){
  	console.log("Device is ready!");
  	$scope.ready = true;

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

  $scope.connectDevice = function(deviceAddress){
  	console.log("Connecting to " + deviceAddress);
    $scope.continueIcon = "settings_bluetooth";
  	bluetoothSerial.connect(deviceAddress, function(result){
  		console.log("I am now connected");
  		console.log(result);
  		$scope.testDevice();
      bluetoothSerial.subscribeRaw('\n', $scope.newMessage, $scope.substribeFailure);
  	}, function(err){
  		console.log("Connection failed");

  		console.log(err);
  	});
  };

  $scope.scanDevices = function(){
    console.log("scanning...");
    $scope.status = "Scanning...";
    $scope.scanIcon = "settings_backup_restore"
    $scope.scanClass = "start";

  	bluetoothScan.getDevices(function(err, results){
  		console.log("scanned");
      $scope.scanClass = "";
      $scope.status = "Found " + results.length;
  		if(err){
  			console.log(err);
        $scope.scanIcon = "error_outline";
  		} else {
  			$scope.devices = results;
        $scope.scanIcon = "autorenew";
  		}
  	});
  }

  $scope.testDevice = function() {
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
    */
    var commandSequence = ["at h1", "at d1", "at sh 79b", "at fc sh 79b", "at fc sd 30 00 20", "at fc sm 1", "21 02"];

    bluetoothSend.send(commandSequence, function(log){
      console.log(JSON.stringify(log));
      $scope.canContinue = true;
      $scope.continueIcon = "done";
    });
  }
/*
  toUTF8Array(str) {
    var utf8 = [];
    for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6),
                      0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12),
                      0x80 | ((charcode>>6) & 0x3f),
                      0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                      | (str.charCodeAt(i) & 0x3ff));
            utf8.push(0xf0 | (charcode >>18),
                      0x80 | ((charcode>>12) & 0x3f),
                      0x80 | ((charcode>>6) & 0x3f),
                      0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
}*/

  $scope.newMessage = function(date){
    console.log("Message received");
    console.log(data);
  }

  $scope.substribeFailure = function(data) {
    console.log("Subscribe failed :(");
    console.log(data);
  }

  $scope.continue = function(){
    $location.path('/home');
  }
});
