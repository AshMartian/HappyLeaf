import Ember from 'ember';

export default Ember.Component.extend({
  classNames:["data", "data-display", "md-whiteframe-z1"],
  dataManager: Ember.inject.service('data-manager'),
  index: 0,

  didInsertElement(){
    if(this.get('widget.bind').length === 0){
      this.get('widget.bind').addObject(this.get('dataManager').availableData()[this.get('index')]);
    }
  }
});
