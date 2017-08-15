import Ember from 'ember';
import _ from 'lodash';
import { translationMacro as t } from "ember-i18n";
import { storageFor } from 'ember-local-storage';


export default Ember.Service.extend({
  i18n: Ember.inject.service(),
  logManager: Ember.inject.service('log-manager'),
  flowManager: Ember.inject.service('flow-manager'),
  settings: storageFor('settings'),

  availableDevices: [],

  shouldReconnect: true,
  isConnected: false,
  lastConnected: "",
  lastAuto: 0,
  isBLE: false,
  BLEService: null,
  lastMessageTime: null,
  onMessage: null,
  failedMessages: false,
  forceSendTimeout: 100,
  connectionAttempts: 0,
  shouldSend: true,

  wifiSocket: typeof Socket == 'undefined' ? null : new Socket(),

  scanDevices(success, failure) {
    this.set('availableDevices', []);
    if(this.get('isConnected')) {
      console.log("Not scanning because is connected");
      if(typeof failure == "function") failure("Already connected");
      return;
    }
    console.log("Scanning.. connected? ", this.get('isConnected'));
    var self = this;
    
    if(typeof bluetoothSerial !== 'undefined' && cordova && cordova.platformId == "android") {
      bluetoothSerial.list(function(results){
        self.set('availableDevices', _.uniqBy(self.get('availableDevices').concat(results), 'address'));
        console.log("got "+results.length+" unpaired bluetooth accessories");
        if(typeof success == "function") success(self.get('availableDevices'));
      });
    } else {
      console.log("Could not get bluetoothSerial");
    }

    if(typeof bluetoothle !== 'undefined') {
      setTimeout(() => {
        bluetoothle.stopScan();
        if(success && !this.get('isConnected')) success(self.get('availableDevices'));
      }, 6000);

      //console.log("Hello bluetoothle!!", bluetoothle);

      var startScan = function(){
        bluetoothle.retrieveConnected(function(devices){
          console.log("Got connected devices", devices);
        });
        bluetoothle.startScan(function(devices) {
          //console.log(devices);
          if (devices.status == "scanResult") {
            //Device found
            //self.set('availableDevices', _.uniqBy(self.get('availableDevices').addObject(devices), 'address'));
            self.set('availableDevices', _.uniqBy(self.get('availableDevices').concat([devices]), 'address'));
            //console.log(self.get('availableDevices'));
            if(typeof success == "function" && !self.get('isConnected')) success(self.get('availableDevices'));
          } else if (devices.status == "scanStarted"){
            //Scan started
          }
        });
      }

      bluetoothle.initialize(function(obj){
        if(obj.status == "enabled"){
          startScan();
        }
      }, function(obj){
        console.log("Got fail ", obj);
      });
    } else {
      console.log("Could not get bluetoothle");
    }

    if(this.get('settings.settings.wifi.allow')){
      this.connectWifiDevice(this.get('settings.settings.wifi.ipaddress'), this.get('settings.settings.wifi.port'), () => {
        if(typeof success == 'function' && !this.get('isConnected')) success(this.get('availableDevices'));
      });
    }
  },

  scanWifi(callback) {
    if(typeof WifiWizard !== 'undefined' && this.get('settings.settings.wifi.allow')) {
      WifiWizard.setWifiEnabled(true, () => {
        WifiWizard.getCurrentSSID((currentWifi) => {
          this.set('currentWifi', currentWifi);
        });
        WifiWizard.startScan(() => {
          WifiWizard.getScanResults((networks) => {
            this.get('logManager').log("Listing wifi networks");
             callback(networks);
            /*setTimeout(() => {
              this.scanDevices();
            }, 4000);
            networks.forEach((network) => {
              /*if(network == this.get('settings.content.lastConnectedWifi') && this.get('currentWifi') !== network){
                //this.connectWifi(network);
              }
            });*/
          }, () => {
            this.get('logManager').log("Could not get Wifi networks");
          });
        });
      }, () => {
        this.get('logManager').log("Could not enable Wifi");
      });
    }
  },

  connectWifi(network, success, failure) {
    //$scope.status = $translate.instant("WELCOME.CONNECTING", {name: network.SSID});
    WifiWizard.connectNetwork(network.SSID, function(){
      setTimeout(() => {
        if(typeof success == 'function') success();
      }, 1500);

    }, function(){
      if(typeof failure == 'function') failure("err");
    });
  },

  subscribe(string, subscriptionFunction){
    //var self = this;
    //this.set('onMessage', subscriptionFunction);
    //this.set('subscribeString', string);
    var self = this;
    this.set('subscriptionFunction', subscriptionFunction);
    if(!this.get('settings.content.lastWifi')){
      if(!this.get('isBLE')){
        console.log("Not BLE");

        bluetoothSerial.subscribe(string, function(data){
          self.set('lastCommand', self.get('tempLast'));
          //shouldSend = true;
          data = data.replace(string, '');
          self.get('logManager').log("Received from bluetooth", data);
          if(typeof self.get('subscriptionFunction') == 'function') self.get('subscriptionFunction')(data, self.get('tempLast'));

          self.set('lastMessageTime', (new Date()).getTime());
        });
      } else {
        console.log("About to subscribe to BLE ", this.get('lastConnected'));
          bluetoothle.unsubscribe();
          var params = {
            address: this.get('lastConnected').address,
            service: this.get('BLEService').uuid,
            characteristic: this.get('BLEService').characteristics[0].uuid,
          }
          bluetoothle.subscribe(function(success){
            try {
              self.get('logManager').log("Subscribe success", window.atob(success.value));
              if(typeof self.get('subscriptionFunction') == 'function' && success.value) self.get('subscriptionFunction')(window.atob(success.value), self.get('tempLast'));
            } catch(e) {
              console.log("Subscribe result NOT BASE64: ", success);
            }
          }, (error) => {
            console.log("Subscribe error", error);
          }, params);
      }
    } else {
      this.get('logManager').log("Subscribing to Wifi ELM");
      var outputCache = "";
      var lastOutput = "";
      this.get('wifiSocket').onData = (data) => {
        this.set('isConnected', true);
        //shouldSend = true;
        // invoked after new batch of data is received (typed array of bytes Uint8Array)
        var output = String(Utf8ArrayToStr(data).replace(/ /g, ""));
        
        try {
          this.get('logManager').log("Received from wifi: " + output + " for " + self.get('tempLast'));
          this.set('lastMessageTime', (new Date()).getTime());
          if(output && output.match(string)) {
            outputCache = "";
            var stringArray = output.split(string);
            if(stringArray.length > 1) {
              stringArray.forEach((outputSplit) => {
                if(outputSplit.substring(0, 5) != lastOutput){
                  lastOutput = outputSplit.substring(0, 5);
                  self.get('subscriptionFunction')(outputSplit, self.get('tempLast'));
                }

              });
            } else {
              self.get('subscriptionFunction')(output, self.get('tempLast'));
            }
          } else {
            self.get('subscriptionFunction')(output, self.get('tempLast'));
            outputCache = outputCache + output;
          }
        } catch(e) {
          console.log("Wifi subscribe error", e);
        }
      };
    }
  },

  //Takes a string array of commands to send to the bluetooth device
  setShouldSend: function(){
    this.set('shouldSend', true);
  },
  currentCommands: [],
  sentCommands: [],
  sendingCommands: false,
  lastCommand: "",
  isWaiting: false,
  failedSend: [],
  resendLast: function(){
    this.set('shouldSend', false);
    sendCode(this.get('lastCommand') + "\r", (data) => {
      this.set('shouldSend', true);
    });
  },
  send: function(array, callback){
    this.set('failedSend', []);
    this.set('sentCommands', []);
    this.set('sendingCommands', true);
    if(Array.isArray(array)) {
      this.set('currentCommands', array);
      var log = [];
      var index = 0;
      //var self = this;

      return array.reduce((promiseChain, command) => {
          return promiseChain.then(() => new Promise((next) => {
        /*if(self.currentCommands[index] != command){
          self.get('logManager').log("Canceling current send request.")
          next(null, 'invalid');
        } else {*/
          //console.log("Sending: ", this);
          index += 1;
          var speed = 200;
          if(command == "ATMA"){
            speed = this.get('forceSendTimeout');
          }
          var forceSend = setTimeout(() => {
              console.log("Forcing send");
              this.set('shouldSend', true);
              this.get('failedSend').push(this.get('lastCommand'));
          }, speed);

          var wait = function(self) {
            if(self.get('shouldSend')){
              clearTimeout(forceSend);
              self.set('isWaiting', false);
              var commandstoSend = command;
              if(commandstoSend != "X") {
                commandstoSend = commandstoSend + "\r";
              }
              self.sendCode(commandstoSend, next);
            } else {
              self.set('isWaiting', true);
              setTimeout(() => {
                wait(self);
              }, 16);
            }
          }

          wait(this);
        })).then(() => {
          //console.log("Promise finished?", index, array.length);
          if(index == array.length){
            console.log("Finished sending commands");

            var forceFinish = setTimeout(() => {
              this.set('shouldSend', true);
            }, 200); //Don't freeze...
            var finish = function(self) {
              if(self.get('shouldSend')){
                clearTimeout(forceFinish);
                self.set('sendingCommands', false);
                callback(log);
              } else {
                setTimeout(() => {
                  finish(self);
                }, 5);
              }
            }
            finish(this);
          }
        });
      }, Promise.resolve());
    } else {
      sendCode(array + "\r", () => {
        this.set('sendingCommands', false);
        callback();
      });
    }
  },

  sendCode(code, next){
    this.set('shouldSend', false);
    if(code !== "\n") this.set('tempLast', code);
    if(!this.get('settings.content.lastWifi')){
      if(!this.get('isBLE')){
        bluetoothSerial.write(code, (output) => {

          
          this.get('sentCommands').push(code);
          if(output && output.match(/OK/g) && (!code.match(/ATM/g) && !code == "X" && !code.match(/0/g))){
            setTimeout(() => {
              this.set('shouldSend', true);
            }, 15);
          }
          this.get('logManager').log("sent: " + code + " got: " + output);

          next();
        }, (err) => {
          this.get('logManager').log("ran into an error " + JSON.stringify(err));
          this.reconnect(() => {
            this.sendCode(code, next);
          });
        });
      } else {
        console.log("Writing to BLE", this.get('BLEService'));
        var params = {
          address: this.get('lastConnected').address,
          service: this.get('BLEService').uuid,
          characteristic: this.get('BLEService').characteristics[0].uuid,
          value: window.btoa(code)
        }
        
        bluetoothle.write((output) => {
          console.log("Got output", output);
          this.set('shouldSend', true);
        }, (err) => {
          console.log("Got write error", err);
        }, params);
      }
    } else {
      if(!this.get('wifiSocket').onData) {
        this.subscribe(this.get('subscriptionFunction'));
      }
      if(this.get('wifiSocket').state == Socket.State.OPENED) {
        console.log("Sending " + code + " To Wifi");
        //var uIntToSend = new TextEncoder("utf-8").encode(commandstoSend);
        var data = new Uint8Array(code.length);
        for (var i = 0; i < data.length; i++) {
          data[i] = code.charCodeAt(i);
        }
        //this.set('tempLast', code);
        try {
          this.get('wifiSocket').write(data, (code) => {
            //if(code !== "\n") this.set('tempLast', code);
            this.get('sentCommands').addObject(this.get('lastCommand'));
            next();
          }, (error) => {
            this.get('logManager').log("Error writing to Wifi device " + JSON.stringify(error));
            this.set('isConnected', false);
            next();
          });
        } catch(e) {
          this.get('logManager').log("Error writing to Wifi device " + JSON.stringify(e));
          this.set('isConnected', false);
          next();
        }
      } else if(this.get('shouldReconnect')){
        console.log("Wifi Closed");
        this.connectWifiDevice(this.get('settings.content.settings.wifi.ipaddress'), this.get('settings.content.settings.wifi.port'), () => {
          this.sendCode(code, next);
        });
      }
    }
  },

  reconnect: function(success, failure){
    if(!cordova.plugins.backgroundMode.isActive() || this.get('shouldReconnect')){
      if(!this.get('settings.content.lastWifi')) {
        this.connectBluetoothDevice(this.get('settings.content.lastConnected'), success, failure);
      } else {
        this.connectWifiDevice(this.get('settings.content.settings..wifi.ipaddress'), this.get('settings.content.settings.wifi.port'), success, failure);
      }
    }
    if(this.get('connectionAttempts') > 3){
      this.set('shouldReconnect', false);
    }
  },

  subscribeDidConnect: function(subscriptionFunction){
    this.set('didConnectFunction', subscriptionFunction);
  },

  didConnect: function() {
    if(this.get('isConnected') && this.get('didConnectFunction') ) {
      this.get('didConnectFunction')();
    }
  }.observes('isConnected'),

  autoConnect: function() {
    this.set('lastConnected', this.get('settings.lastConnected'));
    if(this.get('lastConnected') && (this.get('lastConnected').address || this.get('lastConnected').uuid) && this.get('shouldReconnect') && this.get('connectionAttempts') < 3 && this.get('availableDevices').length !== this.get('lastAuto') && !this.get('isConnected')){
      //console.log("Attempting autoconnect", this.get('lastConnected'), this.get('availableDevices').length);
      this.set('lastAuto', this.get('availableDevices').length);
       for(var i = 0; i < this.get('availableDevices').length; i++) {
         var scannedDevice = this.get('availableDevices')[i];
         console.log(scannedDevice.address);
         if(scannedDevice.address){
           if(scannedDevice.address == this.get('lastConnected').address && (scannedDevice.address.match(":") || scannedDevice.address.match("-"))) {
             this.set('shouldReconnect', false);
             console.log("Found last connected device");
             //this.set('status', t('WELCOME.REMEMBERING', {name: this.get('lastConnected').name}));
             this.get('logManager').log("Found last connected device: " + scannedDevice.address);
             this.connectBluetoothDevice(this.get('lastConnected'));
             break;
           } else if(scannedDevice.address.match(/\\./)) {
             this.set('shouldReconnect', false);
             //this.set('status', t('WELCOME.REMEMBERING',{name: this.get('lastConnected').name}));
             this.get('logManager').log("Found last connected wifi device: " + scannedDevice.address);
             this.connectWifiDevice(this.get('lastConnected').address);
             break;
           }
         }
       }
     }
  }.observes('availableDevices.@each'),

  connectDevice(device, success, failure) {
    this.set('settings.lastConnected', device);
    if(device.address.match(":") || device.address.match("-")) {
      ///this.set('status', t('WELCOME.REMEMBERING', {name: this.get('lastConnected').name}));
      this.get('logManager').log("connecting bluetooth device: " + device);
      this.connectBluetoothDevice(device, success, failure);
    } else if(device.address.match(".")) {
      //this.set('status', t('WELCOME.REMEMBERING',{name: this.get('lastConnected').name}));
      this.get('logManager').log("connecting wifi device: " + device);
      this.connectWifiDevice(device.address, success, failure);
    }
  },

  disconnect(done) {
    this.set('isConnected', false);
    bluetoothle.disconnect(function(){
      bluetoothle.close(done, done, {"address": device.address});
    }, done, {"address": device.address});
    bluetoothSerial.disconnect(done);    
  },

  connectBluetoothDevice: function(device, success, failure) {
    var self = this;
    self.set('lastConnected', device);
    if(this.isConnecting) {
      return;
    }
    self.set('isConnecting', true);
    console.log("Connecting bluetooth", device);

    let disconnect = new Ember.RSVP.Promise((resolve, reject) => {
      bluetoothle.stopScan();
      console.log("Made it to disconnect");
      if(!device.advertisement) {
        this.set('isBLE', false);
        bluetoothSerial.disconnect(resolve);
      } else {
        this.set('isBLE', true);
        bluetoothle.disconnect(function(){
          bluetoothle.close(resolve, resolve, {"address": device.address});
        }, resolve, {"address": device.address});
      }
    }).then(() => {
      var connectionTimeout = setTimeout(() => {
        this.get('logManager').log("Connection Timeout..");
        this.set('isConnected', false);
        self.set('isConnecting', false);

        if(failure) failure(t("WELCOME.TIMEOUT"));
      }, 30000);

      var failedConnect = (err) =>{
        console.log("Failed", err);
        self.set('isConnecting', false);
        if(err.message.match("previously connected")) {
          bluetoothle.close(connect, failedConnect, {"address": device.address});
        } else if(!this.get('shouldReconnect')){
          this.get('logManager').log("Connection failed " + err)
          this.get('logManager').log(JSON.stringify(err));
          window.clearTimeout(connectionTimeout);
          connectionTimeout = null;
          if(typeof failure == "function") failure(err);
        } else {
          if(cordova) {
            cordova.plugins.backgroundMode.disable();
          }
          window.clearTimeout(connectionTimeout);
          //this.reconnect(success, failure);
        }
      }

      var successConnect = (result) => {
        window.clearTimeout(connectionTimeout);
        connectionTimeout = null;
        this.set('shouldReconnect', true);
        this.get('logManager').log("I am now connected to Bluetooth");
        this.get('logManager').log(JSON.stringify(result));
        this.set('isConnected', true);
        self.set('isConnecting', false);
        this.set('settings.content.lastWifi', false);
        if(cordova && cordova.plugins && cordova.plugins.backgroundMode) {
          cordova.plugins.backgroundMode.enable();// Turn screen on
          if(cordova.plugins.backgroundMode.wakeUp){ //create a setting for it
            cordova.plugins.backgroundMode.wakeUp();
            // Turn screen on and show app even locked
            cordova.plugins.backgroundMode.unlock();
          }
        }
        if(typeof success == "function") success(result);
      }

      var getServices = () => {
        bluetoothle.discover((fullDevice) => {
          console.log("BLE got full device");
          console.log(fullDevice);
          this.set('BLEService', null);
          fullDevice.services.forEach((service) => {
            if(service.uuid == "FFE0") {
              this.set('BLEService', service);
            }
          });
          if(!this.get('BLEService')) {
            this.set('BLEService', fullDevice.services[0]);
          }
          successConnect();
        }, failedConnect, {"address": device.address});
      }
      var connect = () => {
        if(!device.advertisement || !this.get('isBLE')) {
          bluetoothSerial.connect(device.address, function(result){
            console.log("Connected to bluetooth");
            successConnect(result);
            bluetoothSerial.readRSSI(function(rssi){
              console.log("Got Bluetooth RSSI: " + rssi);
            });
            //bluetoothSerial.subscribeRaw('\r', $scope.newMessage, $scope.substribeFailure);
          }, failedConnect);
        } else {
          console.log("Detected BLE device");
          bluetoothle.connect((status) => {
            console.log("Connected:", status)
            getServices();
          }, failedConnect, {"address": device.address, "autoconnect": true});
        }
      }
      connect();
    });
  },

  connectWifiDevice: function(ip, port, next, error) {
    if(this.get('wifiSocket')) {
      this.get('wifiSocket').close();
    }
    this.set('wifiSocket', typeof Socket == 'undefined' ? null : new Socket());
    this.get('wifiSocket').onError = this.get('wifiError');
    this.get('wifiSocket').onClose = this.get('wifiClose');
    if(this.get('subscriptionFunction')) {
      console.log("Have subscription function, using it on wifi data");
      this.subscribe(this.get('subscriptionFunction'));
    } else {
      this.get('wifiSocket').onData = () => {
        console.log("Received wifi data, but no function to run");
      };
    }
    if(this.get('wifiSocket')) {
      this.get('wifiSocket').open(ip, port, () => {
          this.get('availableDevices').addObject({
            type: "wifi",
            name: "Wifi OBD",
            address: ip
          });
          this.set('shouldReconnect', true);
          this.set('settings.content.lastWifi', true);
          this.set('isBLE', false);
          this.set('isConnected', true);
          this.get('logManager').log("Connected to Wifi!");
          this.get('wifiSocket').onError = this.wifiError;
          this.get('wifiSocket').onClose = this.wifiClose;
          if(cordova) {
            cordova.plugins.backgroundMode.enable();
          }
          next();
        }, (errorMessage) => {
          //self.lastWifi = false;
          this.get('logManager').log("Could not connect to wifi " + JSON.stringify(errorMessage));
          // invoked after unsuccessful opening of socket
          if(this.get('shouldReconnect')) {
            this.reconnect(next, error);
          } else {
            if(cordova) {
              cordova.plugins.backgroundMode.disable();
              //use setting
              if(cordova.plugins.backgroundMode.wakeUp){
                cordova.plugins.backgroundMode.wakeUp();
                // Turn screen on and show app even locked
                cordova.plugins.backgroundMode.unlock();
              }
            }
            error(errorMessage);
          }

      });
    } else {
      this.get('logManager').log("Wifi Socket null :(");
      if(cordova) {
        cordova.plugins.backgroundMode.disable();
      }
      next();
    }
  },

  wifiError(err) {
    if(this.get('settings.lastWifi')) this.set('isConnected', false);
    this.get('logManager').log("There was an error with Wifi: " + JSON.stringify(err));
  },

  wifiClose(err) {
    if(this.get('settings.lastWifi')) this.set('isConnected', false);
    this.get('logManager').log("Wifi has been disconnected: " + JSON.stringify(err));
  }

});


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
