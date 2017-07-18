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
  openNav: false,

  homeLocked: true,

  messagesReceived: [],
  messagesWithoutData: [],

  lastSave: null,
  lastMessageTime: null,

  isReady: subscribe('cordova.deviceready', function() {
    console.log("Device is ready!");
    this.requestMessages();
    this.get('connectionManager').subscribe((output) => {
      this.parseMessages(output);
    });
  }),

  didInsertElement() {
    console.log("Home Inserted");
    /*$(window).scroll(function() { console.log("Scrolled"); });
    $(this).$on('touchmove', function(e){
      console.log("Touch moved ", e);
      e.preventDefault();
    })*/
    this.requestMessages();
  },

  requestMessages: function() {
    if(typeof bluetoothSerial !== undefined) {
      this.get('connectionManager').subscribe("\r", (output) => {
        this.parseMessages(output);
      });
    }
    //console.log("Is connected? ", this.get('connectionManager').isConnected);
    if(this.get('connectionManager').isConnected) {
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
        this.get('flowManager').requestCharging((err, status) => {
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
      if(!this.get('lastSave') || this.get('lastSave') - now > this.get('settings.settings.experimental.historyInterval')) {
        this.set('lastSave', now);
        this.get('logManager').saveHistory();
      }
    } else {
      this.get('connectionManager').scanDevices((result) => {
        //console.log("Rescanned devices", result);
      });
    }
  },

  watchConnected: function(){
    this.requestMessages();
  }.observes('connectionManager.isConnected'),

  parseMessages: function(output){
      this.set('lastMessageTime', (new Date()).getTime());
      var lastCommand = this.get('connectionManager').lastCommand;
      //console.log("Parsing message: " + output);
      //if(output.indexOf("?") > -1){
      /*if(false){
        bluetoothSend.resendLast();

      } else {*/
        if(output.indexOf(">") > 0 || output.match(/ok/i)){ //|| lastResponse.substring(0, 3) == output.substring(0, 3)
          this.get('connectionManager').setShouldSend();
        }

        if(!output.match(/ok|stopped|no/i)){
          this.get('messagesReceived').addObject(output);
          this.get('dataManager').parseResponse(output, lastCommand);
        }
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
