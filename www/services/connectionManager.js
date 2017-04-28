happyLeaf.factory('connectionManager', ['logManager', "$localStorage", "$rootScope", "$translate", function(logManager, $localStorage, $rootScope, $translate){
  var shouldSend = false;
  var gotMessage = false;
  var forceSend = true;
  var platform = (navigator.userAgent.match(/iPad/i))  == "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : (navigator.userAgent.match(/BlackBerry/i)) == "BlackBerry" ? "BlackBerry" : "null";

  var sendCode = function(code, next){
    shouldSend = false;
    if(!self.lastWifi){
      bluetoothSerial.write(code, function(output){
        logManager.log("sent: " + code + " got: " + output);
        self.lastCommand = code;
        self.sentCommands.push(self.lastCommand);
        next();
      }, function(err){
        logManager.log("ran into an error " + JSON.stringify(err));
        self.reconnect(function(){
          sendCode(code, next);
        });
      });
    } else {
      if(self.wifiSocket.state == Socket.State.OPENED) {
        console.log("Sending " + code + " To Wifi");
        //var uIntToSend = new TextEncoder("utf-8").encode(commandstoSend);
        var data = new Uint8Array(code.length);
        for (var i = 0; i < data.length; i++) {
          data[i] = code.charCodeAt(i);
        }
        try {
          self.wifiSocket.write(data, function(data){
            self.lastCommand = code;
            self.sentCommands.push(self.lastCommand);
            next();
          }, function(error){
            logManager.log("Error writing to Wifi device " + JSON.stringify(error));
            self.isConnected = false;
            next();
          });
        } catch(e){
          logManager.log("Error writing to Wifi device " + JSON.stringify(e));
          self.isConnected = false;
          next();
        }
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
    failedMessages: false,
    forceSendTimeout: 100,

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
          $rootScope.$broadcast('connected', false);
        });
      } else {
        logManager.log("Cannot find bluetooth");
        self.status = $translate.instant("WELCOME.NO_BLUETOOTH");
      }
      if(self.wifiSocket !== null && self.lastWifi) {
        if(self.wifiSocket.state == Socket.State.OPENED) {
          self.isConnected = true;
          $rootScope.$broadcast('connected', true);
        } else if(self.wifiSocket.state == Socket.State.CLOSED){
          self.isConnected = false;
          $rootScope.$broadcast('connected', false);
          self.reconnect(function(){
            self.isConnected = true;
            $rootScope.$broadcast('connected', true);
          }, function(){
            self.checkConnection();
          });
        }
      }
      if(now - self.lastMessageTime > 8000) {
        logManager.log("Forcing not connected... " + now - self.lastMessageTime +"ms since last message");
        self.isConnected = false;
        $rootScope.$broadcast('connected', false);
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
      bluetoothSerial.list(function(results1) {
        self.availableDevices = self.availableDevices.concat(results1);
        console.log("got "+results1.length+" unpaired bluetooth accessories");
        console.log(JSON.stringify(results1));
        success(self.availableDevices);
        if(platform == "Android"){
          bluetoothSerial.discoverUnpaired(function(unpaired){
            self.availableDevices = self.availableDevices.concat(unpaired);
            logManager.log("got "+unpaired.length+" unpaired bluetooth accessories")
            logManager.log(JSON.stringify(unpaired));
            bluetoothSerial.list(function(results) {
              self.availableDevices = self.availableDevices.concat(results);
              self.availableDevices = _.uniqBy(self.availableDevices, 'address');
            	logManager.log("got "+results.length+" bluetooth accessories")
            	logManager.log(JSON.stringify(results));

              bluetoothSerial.setDiscoverable(function(){
                bluetoothSerial.discoverUnpaired(function(devices){
                  self.availableDevices = self.availableDevices.concat(devices);
                  self.availableDevices = _.uniqBy(self.availableDevices, 'address');
                });
              });
            },
            function(err) {
              failure(err);
            });
          });
        }
      }, function(err){
        failure(err);
      })
    },

    subscribe: function(string, subscriptionFunction){
      self.onMessage = subscriptionFunction;
      if(!self.lastWifi){
        bluetoothSerial.subscribe(string, function(data){
          subscriptionFunction(data);

          self.lastMessageTime = (new Date()).getTime();
        });
      } else {
        logManager.log("Subscribing to Wifi ELM");
        self.wifiSocket.onData = function(data) {
          // invoked after new batch of data is received (typed array of bytes Uint8Array)
          var output = Utf8ArrayToStr(data).replace(/ /g, "");
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
    sendingCommands: false,
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
      self.sendingCommands = true;
      if(Array.isArray(array)) {
        self.currentCommands = array;
        var log = [];
        var index = 0;
        async.eachSeries(array, function(command, next) {
          if(self.currentCommands[index] != command){
            logManager.log("Canceling current send request.")
            next(null, 'invalid');
          } else {
            index ++;
            var speed = 400;
            if(command == "ATMA"){
              speed = self.forceSendTimeout;
            }
            var forceSend = setTimeout(function(){
                shouldSend = true;
                self.failedSend.push(self.lastCommand);
                console.log("Forcing send");
            }, speed);

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
          }
        }, function(err){
          if(err) callback(err);
          var forceFinish = function(){
            shouldSend = true;
          };
          setTimeout(forceFinish, 400); //Don't freeze...
          var finish = function(){
            if(shouldSend){
              clearTimeout(forceFinish);
              self.sendingCommands = false;
              callback(null, log);
            } else {
              setTimeout(finish, 5);
            }
          }
          finish();
        });
      } else {
        sendCode(array + "\r", function(){
          self.sendingCommands = false;
          callback();
        });

      }
    },

    reconnect: function(success, failure){
      if(!cordova.plugins.backgroundMode.isActive() || self.shouldReconnect){
        if(!self.lastWifi) {
          self.connectBluetoothDevice($localStorage.lastConnected.address, success, failure);
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
        var connectionTimeout = setTimeout(function(){
          logManager.log("Connection Timeout..");
          self.isConnected = false;
          failure($translate.instant("WELCOME.TIMEOUT"));
        }, 20000);

        bluetoothSerial.connect(deviceMac, function(result){
          clearTimeout(connectionTimeout);
          connectionTimeout = null;
          logManager.log("I am now connected to Bluetooth");
          logManager.log(JSON.stringify(result));
          self.isConnected = true;
          $rootScope.$broadcast('connected', true);
          self.lastWifi = false;
          $localStorage.lastWifi = false;
          bluetoothSerial.readRSSI(function(ssi){
            console.log("Got Bluetooth SSI: " + ssi);
          })

          success(result);
          //bluetoothSerial.subscribeRaw('\r', $scope.newMessage, $scope.substribeFailure);
        }, function(err){
          if(connectionTimeout){
            logManager.log("Connection failed " + err)
            logManager.log(JSON.stringify(err));
            clearTimeout(connectionTimeout);
            connectionTimeout = null;
            $rootScope.$broadcast('connected', false);
            failure(err);
          } else {
            clearTimeout(connectionTimeout);
            self.connectBluetoothDevice(deviceMac, success, failure);
          }
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
            $localStorage.lastWifi = true;
            self.isConnected = true;
            logManager.log("Connected to Wifi!");
            self.wifiSocket.onError = self.wifiError;
            self.wifiSocket.onClose = self.wifiClose;
            next();
          },
          function(errorMessage) {
            //self.lastWifi = false;
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
