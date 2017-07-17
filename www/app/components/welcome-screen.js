import Ember from 'ember';

export default Ember.Component.extend({
  connectionManager: Ember.inject.service('connection-manager'),
  storageManager: Ember.inject.service('storage-manager'),
  scanIcon: 'autorenew',
  continueIcon: 'pan_tool',
  status: "Loading...",

  discoveredDevices: [{
    name: "Test",
    address: "12:34"
  },
  {
    name: "Test 2",
    address: "123:2321"
  },{
    name: "Test 3",
    address: "12:34"
  },
  {
    name: "Test 4",
    address: "123:2321"
  },{
    name: "Test 5",
    address: "12:34"
  },
  {
    name: "Test 6",
    address: "123:2321"
  }],

  wifiNetworks: ["For the Horde"],

  init() {
    this._super();

    document.addEventListener('deviceready', function () {
      console.log("Device is ready!");

      console.log("Bluetooth: ", ble);
    });
  },


  actions: {
    connectDevice(device) {
      console.log("Connecting to device", device);
    },

    connectWifi(network) {
      console.log("Connecting to network", network);
    }
  }
});
