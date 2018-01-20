import Ember from 'ember';

export default Ember.Component.extend({
  classNames:["data", "md-whiteframe-z1"],
  dataManager: Ember.inject.service('data-manager'),

  useKw: Ember.computed('dataManager.data.watts', function() {
    var mode = this.get('widget.settings.mode');
    //console.log("Remaining mode", mode);
    if(mode == "kwh") {
      return true;
    } else if (mode == "wh") {
      return false;
    } else {
      if(this.get('dataManager.data').watts > 10000) {
        return true;
      } else {
        return false;
      }
    }
  })
});
