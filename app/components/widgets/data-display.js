import Ember from 'ember';

export default Ember.Component.extend({
  classNames:["data", "data-display", "md-whiteframe-z1"],
  dataManager: Ember.inject.service('data-manager'),
  index: 0,

  isTime: Ember.computed('widget.bind', function(){
    console.log("Checking if is time");
    if(this.get('widget.bind').objectAt(0).match(/time/i)) {
      return true;
    } else {
      return false;
    }
  }),

  didInsertElement(){
    if(this.get('widget.bind').length === 0){
      this.get('widget.bind').addObject(this.get('dataManager').availableData()[this.get('index')]);
    }
  }
});
