import Ember from 'ember';

export default Ember.Component.extend({
  devices:[],
  wifi:[],
  selectedDevice: "",
  actions: {
    connectDevice(device) {
      this.set('selectedDevice', device);
      this.sendAction('connectDevice', device);
    },

    connectWifi(network) {
      this.set('selectedNetwork', network);
      this.sendAction('connectWifi', network);
    }
  }
});
