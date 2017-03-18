happyLeaf.factory('connectionManager', function(){
  var self = {
    availableDevices: [],
    isConnected: false,
    lastConnected: "",

    scanDevices: function(success, failure) {
      console.log("Scanning inside manager");
      setInterval(function(){
        bluetoothSerial.isConnected(function(connected){
          self.isConnected = true;
          //console.log("Got connected " + connected);
        }, function(err){
          console.log("is Disconnected " + err);

          self.isConnected = false;
        });
      }, 2000);


      bluetoothSerial.list(function(results) {
        self.availableDevices = results;
      	console.log("got "+results.length+" bluetooth accessories")
      	console.log(JSON.stringify(results));
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
        if(isConnected){
          bluetoothSerial.disconnect(function(){
            callback();
          });
        } else {
          callback();
        }
      }, function(callback){
        bluetoothSerial.connect(deviceMac, function(result){
          console.log("I am now connected");
          console.log(result);
          self.isConnected = true;
          success(result);
          //bluetoothSerial.subscribeRaw('\r', $scope.newMessage, $scope.substribeFailure);
        }, function(err){
          console.log("Connection failed " + err)
          failure(err);
          console.log(err);
        });
      });
    }
  };

  return self;
});
