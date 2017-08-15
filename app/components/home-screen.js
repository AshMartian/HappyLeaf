import Ember from 'ember';

import subscribe from 'ember-cordova-events/utils/subscribe';
import { translationMacro as t } from "ember-i18n";
import { storageFor } from 'ember-local-storage';

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  tagName: "main",
  connectionManager: Ember.inject.service('connection-manager'),
  storageManager: Ember.inject.service('storage-manager'),
  logManager: Ember.inject.service('log-manager'),
  dataManager: Ember.inject.service('data-manager'),
  flowManager: Ember.inject.service('flow-manager'),
  cordova: Ember.inject.service('ember-cordova/events'),
  settings: storageFor('settings'),
  history: storageFor('history'),
  router: null,
  openNav: false,

  homeLocked: true,

  messagesReceived: [],
  messagesWithoutData: [],

  lastSave: null,
  lastMessageTime: null,

  requesting: false,

  isReady: subscribe('cordova.deviceready', function() {
    console.log("Device is ready!");
    this.set('requesting', true);
    this.requestMessages();
  }),

  didInsertElement() {
    console.log("Home Inserted");
    /*$(window).scroll(function() { console.log("Scrolled"); });
    $(this).$on('touchmove', function(e){
      console.log("Touch moved ", e);
      e.preventDefault();
    })*/
    var oldMilesDriven = window.localStorage.getItem("ngStorage-mileDriven")
    if(oldMilesDriven) {
      this.set('history.milesDriven', oldMilesDriven);
      window.localStorage.removeItem("ngStorage-mileDriven");
    }

    this.set('lastSave', (new Date()).getTime());
  },

  willRender() {
    if(typeof cordova !== "undefined" && !this.get('requesting')) { //just check to see if it exists
      this.requestMessages();
    }
  },

  willDestroyElement() {
    this.set('requesting', false);
  },

  requestMessages: function() {
    if(!this.get('requesting')){
      return;
    }
    if(typeof bluetoothSerial !== "undefined") {
      this.get('connectionManager').subscribe("\r", (output, request) => {
        this.parseMessages(output, request);
      });
    }
    //console.log("Is connected? ", this.get('connectionManager').isConnected);
    if(this.get('messagesWithoutData').length > 15) {
      setTimeout(() => {
        console.log("Pretty sure car is off..");
        this.set('messagesWihtoutData', []);
        this.requestMessages();
      }, 5000);
    } else if(this.get('connectionManager').isConnected) {
      if(this.get('dataManager').transmission == "P" && !this.get('dataManager').isCharging){ //chech for dtc every 10 minutes
        if(now - this.get('flowManager').lastDTCRequest > 600000){
          this.get('flowManager').requestDTC((err, status) => {
            this.requestMessages();
          });
        } else {
          this.get('flowManager').requestParked((err, status) => {
            this.requestMessages();
          });
        }
      } else if(this.get('dataManager').isCharging) {
        if(this.get('dataManager').transmission == "T") this.get('dataManager').transmission = "P";
        this.get('flowManager').requestDriving((err, status) => {
          this.requestMessages();
        });
      } else {
        this.get('flowManager').requestDriving((err, status) => {
          this.requestMessages();
        });
      }
      var now = (new Date()).getTime();
      if(!this.get('settings.settings.experimental.historyInterval')) {
        this.set('settings.settings.experimental.historyInterval', 20000);
      }
      /*if(!this.get('lastSave') || this.get('lastSave') - now > this.get('settings.settings.experimental.historyInterval')) {
        this.set('lastSave', now);
        this.get('logManager').saveHistory();
      }*/
    } else {
      console.log("Not connected at home");
      this.get('connectionManager').scanDevices((result) => {
        //console.log("Rescanned devices", result);
      });
    }
  },

  watchConnected: function(){
    this.requestMessages();
  }.observes('connectionManager.isConnected'),

  parseMessages: function(output, lastCommand){
      this.set('lastMessageTime', (new Date()).getTime());
      //console.log("Parsing message: " + output);
      //if(output.indexOf("?") > -1){
      /*if(false){
        bluetoothSend.resendLast();

      } else {*/
        if(output && output.indexOf(">") > 0 || output.match(/ok/i)){ //|| lastResponse.substring(0, 3) == output.substring(0, 3)
          this.get('connectionManager').setShouldSend();
        }

        //if(!output.match(/ok|stopped|no/i)){
        //this.get('messagesReceived').addObject(output);
        this.get('dataManager').parseResponse(output, lastCommand);
        //}
        if(output.match(/no/i)) {
          this.get('messagesWithoutData').addObject(lastCommand);
        }
        //connectionManager.shouldSend();
      //}
      if(this.get('renderLog')) { //this take the dom to it's knees (IN ANGULAR!)
        this.set('logOutput', this.get('logManager').logText);
      }
    }

});
