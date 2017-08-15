import Ember from 'ember';

import subscribe from 'ember-cordova-events/utils/subscribe';
import { translationMacro as t } from "ember-i18n";

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  connectionManager: Ember.inject.service('connection-manager'),
  storageManager: Ember.inject.service('storage-manager'),
  logManager: Ember.inject.service('log-manager'),
  flowManager: Ember.inject.service('flow-manager'),
  cordova: Ember.inject.service('ember-cordova/events'),
  scanIcon: 'autorenew',
  scanClass: '',
  continueIcon: 'pan_tool',
  status: t('WELCOME.LOADING_TEXT'),
  canContinue: false,
  router: null,
  goingHome: false,

  discoveredDevices: [],

  wifiNetworks: [],

  isReady: subscribe('cordova.deviceready', function() {
    console.log("Device is ready!");
    window.plugins.insomnia.keepAwake();
    
    if(cordova.platformId == "Android") {
      window.light = cordova.require("cordova-plugin-lightSensor.light");
      window.light.enableSensor();
    }
    if(this.get('connectionManager').isConnected) {
      this.set('connectionManager.shouldReconnect', false);
      this.set('canContinue', true);
    }
    this.send('scanDevices');
  }),

  didInsertElement() {
    if(this.get('connectionManager').isConnected) {
      this.set('connectionManager.shouldReconnect', false);
      this.set('canContinue', true);
      this.get('connectionManager').disconnect();
    }
  },

  testDevice: function() {
    if(!this.get('canContinue')){
      this.set('goingHome', false);
      this.get('logManager').log("Testing device");
      this.get('connectionManager').setShouldSend();
      this.set('status', t('WELCOME.TESTING'));

      var responses = [];
      var self = this;
      this.get('connectionManager').subscribe(">", (output) => {
        this.get('logManager').log("Subscribe got: " + output);
        output = output.substring(0, output.length - 1);
        this.get('connectionManager').setShouldSend();
        responses.push(output);

        if(output.indexOf("ELM") !== -1){
          this.get('logManager').log("Success!");
          this.set('canContinue', true);
          setTimeout(() => {
            this.send('goToHome');
          }, 2000);
          output = output.substring(output.indexOf("ELM"));
          this.set('continueIcon', "done");
          this.set('continueClass', "");
          this.set('output', output);
          this.set('status', t('WELCOME.SUCCESS', {output: "output"}));
        } else if(!this.get('canContinue')) {
          this.get('connectionManager').setShouldSend();
          this.set('status', "Reading: " + output);
        } else {
          console.log("Could not continue in subscription chain");
        }
      }, (err) => {
        this.get('logManager').log(err);
      });

      this.get('logManager').log("Testing...");
      this.get('flowManager').requestConnecting((err, status) => {
        setTimeout(() => {
          if(!this.get('canContinue') && this.get('connectionManager').isConnected) {
            this.testDevice();
          }
        }, 2000);
        console.log("Flow manager finished connection sequence! ", status);
      });
    } else {
      this.get('logManager').log("Not testing because already can continue");
    }
  }.observes('connectionManager.isConnected'),

  actions: {
    goToHome() {
      if(!this.get('goingHome')){
        console.log("Going to /home");
        this.set('goingHome', true);
        if(this.get('goHome')) this.get('goHome')();
      }

    },

    scanDevices(){
      this.set('scanIcon', 'settings_backup_restore');
      this.set('scanClass', 'rotate');
      this.set('status', t('WELCOME.SCANNING'));
      if(this.get('connectionManager').isConnected){ 
        this.testDevice();
      }
      setTimeout(() => {
        this.set('scanIcon', 'autorenew');
        this.set('scanClass', '');
      }, 10000);

      this.get('connectionManager').scanDevices((devices) => {
        //console.log(`SUCCESS! ${devices.length} Got devices`, devices);
        if(!this.get('connectionManager').isConnecting && !this.get('connectionManager').isConnected) {
          this.set('status', t('WELCOME.FOUND', {length: "foundDevices"}));
        }
        this.set('foundDevices', devices.length.toString());
        
        this.set('discoveredDevices', devices);
      }, false);

      this.get('connectionManager').scanWifi((networks) => {
        console.log(networks);
        this.set('wifiNetworks', networks);
      });
    },

    connectDevice(device) {
      console.log("Connecting to device", device);
      this.set('connectedName', device.name);
      this.set('canContinue', false);
      this.set('status', t('WELCOME.CONNECTING', {name: "connectedName"}));
      this.get('connectionManager').connectDevice(device, (success) => {
        this.set('status', t('WELCOME.CONNECTED'));
        console.log("Got connection success from welcome component ", success);
      }, (err) => {
        this.set('status', t('WELCOME.CONNECTION_FAILED'));
        console.log("Had an error: ", err);
      });
    },

    connectWifi(network) {
      console.log("Connecting to network", network);
      this.set('canContinue', false);
      this.get('connectionManager').connectWifi(network, (success) => {
        let scanTrys = 0;
        setInterval(() => {
          if(scanTrys < 4 && !this.get('connectionManager').isConnected) {
            scanTrys ++;
            this.send('scanDevices');
          }
        }, 1500);
        
      });
    }
  }
});
