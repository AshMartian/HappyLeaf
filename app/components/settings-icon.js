import Ember from 'ember';

export default Ember.Component.extend({
  settingsIcon: "settings",
  showDialog: false,

  actions: {
    toggleDialog(state) {
      console.log("Showing dialog", state);
      this.set('showDialog', state);
    }
  }
});
