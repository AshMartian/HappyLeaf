import Ember from 'ember';

export default Ember.Component.extend({
  classNames:["data", "md-whiteframe-z1"],
  dataManager: Ember.inject.service('data-manager'),
});
