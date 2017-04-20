happyLeaf.factory('connectionManager', ['logManager', "$localStorage", "$rootScope", function(logManager, $localStorage, $rootScope){
  var shouldSend = false;
  var forceSend = true;
  var sendBluetoothCode = function(code, callback){
    shouldSend = false;
    bluetoothSerial.write(code, function(data){
      logManager.log("sent: " + code + " got: " + data);
      callback(data);
    }, function(err){
      logManager.log("ran into an error " + JSON.stringify(err));
      callback(err);
    });
  };

  var sendCode = function(code, next){
    shouldSend = false;
    if(!self.lastWifi){
      sendBluetoothCode(code, function(data){
        self.lastCommand = code;
        self.sentCommands.push(self.lastCommand);
        next();
      });
    } else {
      if(self.wifiSocket.state == Socket.State.OPENED) {
        console.log("Sending " + code + " To Wifi");
        //var uIntToSend = new TextEncoder("utf-8").encode(commandstoSend);
        var data = new Uint8Array(code.length);
        for (var i = 0; i < data.length; i++) {
          data[i] = code.charCodeAt(i);
        }
        self.wifiSocket.write(data, function(){
          self.lastCommand = code;
          self.sentCommands.push(self.lastCommand);
          next();
        }, function(error){
          logManager.log("Error writing to Wifi device " + JSON.stringify(error));
          self.isConnected = false;
          next();
        });
      } else if(self.shouldReconnect){
        console.log("Wifi Closed");
        self.connectWifiDevice($localStorage.settings.wifi.ipaddress, $localStorage.settings.wifi.port, function(){
          sendCode(code, next);
        });
      }
    }
  }

  var self = {
    availableDevices: [],
    isConnected: false,
    lastConnected: "",
    lastWifi: $localStorage.lastWifi || false,
    lastMessageTime: null,
    onMessage: null,

    wifiSocket: typeof Socket == 'undefined' ? null : new Socket(),

    checkConnection: function(){
      var now = (new Date()).getTime();

      if(typeof bluetoothSerial !== 'undefined' && !self.lastWifi){
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
      if(self.wifiSocket !== null && self.lastWifi) {
        if(self.wifiSocket.state == Socket.State.OPENED) {
          self.isConnected = true;
        } else if(self.wifiSocket.state == Socket.State.CLOSED){
          self.isConnected = false;
          self.reconnect(function(){
            self.isConnected = true;
          }, function(){
            self.checkConnection();
          });
        }
      }
      if(now - self.lastMessageTime > 8000) {
        logManager.log("Forcing not connected... " + now - self.lastMessageTime +"ms since last message");
        self.isConnected = false;
      }
    },

    scanDevices: function(success, failure) {
      self.availableDevices = [];
      logManager.log("Scanning inside manager");
      if($localStorage.settings.wifi.ipaddress !== "192.168.0.10"){
        self.connectWifiDevice('192.168.0.10', '35000', function(){
          success(self.availableDevices);
        });
      }
      self.connectWifiDevice($localStorage.settings.wifi.ipaddress, $localStorage.settings.wifi.port, function(){
        success(self.availableDevices);
      });

      bluetoothSerial.list(function(results) {
        self.availableDevices = self.availableDevices.concat(results);
      	logManager.log("got "+results.length+" bluetooth accessories")
      	logManager.log(JSON.stringify(results));
        success(self.availableDevices);

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

    subscribe: function(string, subscriptionFunction){
      self.onMessage = subscriptionFunction;
      if(!self.lastWifi){
        bluetoothSerial.subscribe(string, function(date){
          subscriptionFunction(data);
          self.lastMessageTime = (new Date()).getTime();
        });
      } else {
        logManager.log("Subscribing to Wifi ELM");
        self.wifiSocket.onData = function(data) {
          // invoked after new batch of data is received (typed array of bytes Uint8Array)
          var output = Utf8ArrayToStr(data);
          logManager.log("Received from wifi: " + output);
          self.lastMessageTime = (new Date()).getTime();
          if(output.match(string)){
            var stringArray = output.split(string);
            if(stringArray.length > 1) {
              var lastOutput = "";
              async.forEach(stringArray, function(outputSplit){
                if(outputSplit.substring(0, 5) != lastOutput){
                  lastOutput = outputSplit.substring(0, 5);
                  subscriptionFunction(outputSplit);
                }

              })
            } else {
              subscriptionFunction(output);
            }
          }
        };
      }
    },

    //Takes a string array of commands to send to the bluetooth device
    shouldSend: function(){
      shouldSend = true;
    },
    currentCommands: [],
    sentCommands: [],

    lastCommand: "",
    isWaiting: false,
    failedSend: [],
    resendLast: function(){
      shouldSend = false;
      sendCode(self.lastCommand + "\r", function(data){
        shouldSend = true;
        forceSend = true;
      });
    },
    send: function(array, callback){
      self.failedSend = [];
      self.sentCommands = [];
      if(Array.isArray(array)) {
        self.currentCommands = array;
        var log = [];
        async.eachSeries(array, function(command, next) {
          var forceSend = setTimeout(function(){
              shouldSend = true;
              self.failedSend.push(self.lastCommand);
              console.log("Forcing send");
          }, 320);

          var wait = function(){
            if(shouldSend){
              clearTimeout(forceSend);
              self.isWaiting = false;
              var commandstoSend = command;
              if(commandstoSend != "X") {
                commandstoSend = commandstoSend + "\r";
              }
              sendCode(commandstoSend, next);
            } else {
              self.isWaiting = true;
              setTimeout(wait, 8);
            }
          }

          wait();
        }, function(err){
          callback(log);
        });
      } else {
        sendCode(array + "\r", callback);
      }
    },

    reconnect: function(success, failure){
      if(!cordova.plugins.backgroundMode.isActive()){
        if(!self.lastWifi) {
          self.connectBluetoothDevice($localStorage.lastConnected, success, failure);
        } else {
          self.connectWifiDevice($localStorage.settings.wifi.ipaddress, $localStorage.settings.wifi.port, success, failure);
        }
      }
    },

    connectBluetoothDevice: function(deviceMac, success, failure) {
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
        var timeout = setTimeout(function(){
          logManager.log("Connection Timeout..");
          self.isConnected = false;
          failure("Connection Timeout");
        }, 12000);

        bluetoothSerial.connect(deviceMac, function(result){
          logManager.log("I am now connected to Bluetooth");
          logManager.log(JSON.stringify(result));
          self.isConnected = true;
          self.lastWifi = false;
          clearTimeout(timeout);
          success(result);
          //bluetoothSerial.subscribeRaw('\r', $scope.newMessage, $scope.substribeFailure);
        }, function(err){
          logManager.log("Connection failed " + err)
          clearTimeout(timeout);
          failure(err);
          logManager.log(JSON.stringify(err));
        });
      });
    },

    connectWifiDevice: function(ip, port, next, error) {
      if(self.wifiSocket) {
        self.wifiSocket.close();
      }
      self.wifiSocket = typeof Socket == 'undefined' ? null : new Socket();
      if(self.wifiSocket) {
        self.wifiSocket.open(ip, port, function() {
            self.availableDevices.push({
              type: "wifi",
              name: "Wifi OBD",
              address: ip
            });
            self.lastWifi = true;
            self.isConnected = true;
            logManager.log("Connected to Wifi!");
            self.wifiSocket.onError(function(err) {
              if(self.lastWifi) self.isConnected = false;
              logManager.log("There was an error with Wifi: " + JSON.stringify(err));
            });
            self.wifiSocket.onClose(function(error){
              if(self.lastWifi) self.isConnected = false;
              logManager.log("Wifi has been disconnected: " + JSON.stringify(err));
            });
            next();
          },
          function(errorMessage) {
            self.lastWifi = false;
            logManager.log("Could not connect to wifi " + JSON.stringify(errorMessage));
            // invoked after unsuccessful opening of socket
            error(errorMessage);
        });
      } else {
        logManager.log("Wifi Socket null :(");
        next();
      }
    },

    wifiError: function(err) {
      if(self.lastWifi) self.isConnected = false;
      logManager.log("There was an error with Wifi: " + JSON.stringify(err));
    },

    wifiClose: function(err) {
      if(self.lastWifi) self.isConnected = false;
      logManager.log("Wifi has been disconnected: " + JSON.stringify(err));
    }
  };

  return self;

  setInterval(self.checkConnection, 1000);
}]);

function Utf8ArrayToStr(array) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = array.length;
    i = 0;
    while(i < len) {
    c = array[i++];
    switch(c >> 4)
    {
      case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
      case 12: case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
        break;
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(((c & 0x0F) << 12) |
                       ((char2 & 0x3F) << 6) |
                       ((char3 & 0x3F) << 0));
        break;
    }
    }

    return out;
}
