happyLeaf.factory('connectionManager', ['logManager', function(logManager){
  var self = {
    availableDevices: [],
    isConnected: false,
    lastConnected: "",

    scanDevices: function(success, failure) {
      logManager.log("Scanning inside manager");
      setInterval(function(){
        if(bluetoothSerial){
          bluetoothSerial.isConnected(function(connected){
            self.isConnected = true;
            //logManager.log("Got connected " + connected);
          }, function(err){
            logManager.log("is Disconnected " + err);

            self.isConnected = false;
          });
        } else {
          logManager.log("Cannot find bluetooth");
          self.status = $translate.instant("WELCOME.NO_BLUETOOTH");
        }

      }, 2000);


      bluetoothSerial.list(function(results) {
        self.availableDevices = results;
      	logManager.log("got "+results.length+" bluetooth accessories")
      	logManager.log(JSON.stringify(results));
        success(results);
        bluetoothSerial.setDiscoverable(function(){
          bluetoothSerial.discoverUnpaired(function(devices){
            self.availableDevices = self.availableDevices.concat(devices);
          });
        });
      },
      function(error) {
        failure(err);
      });
    },

    reconnect: function(success, failure){
      if(self.lastConnected){
        self.connectDevice(self.lastConnected, success, failure);
      } else {
        failure("No last connected device");
      }
    },

    connectDevice: function(deviceMac, success, failure) {
      self.lastConnected = deviceMac;
      async.waterfall(function(callback){
        if(self.isConnected){
          bluetoothSerial.disconnect(function(){
            callback();
          });
        } else {
          callback();
        }
      }, function(callback){
        setTimeout(function(){
          logManager.log("Connection Timeout..");
          failure("Connection Timeout");
        }, 10000);
        bluetoothSerial.connect(deviceMac, function(result){
          logManager.log("I am now connected");
          logManager.log(JSON.stringify(result));
          self.isConnected = true;
          success(result);
          //bluetoothSerial.subscribeRaw('\r', $scope.newMessage, $scope.substribeFailure);
        }, function(err){
          logManager.log("Connection failed " + err)
          failure(err);
          logManager.log(JSON.stringify(err));
        });
      });
    }
  };

  return self;
}]);
