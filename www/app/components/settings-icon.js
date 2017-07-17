import Ember from 'ember';

export default Ember.Component.extend({
  settingsIcon: "settings",
  showDialog: false,

  actions: {
    showDialog(state) {
      this.set('showDialog', state);
    }
  }
});
