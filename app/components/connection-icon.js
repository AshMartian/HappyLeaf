import Ember from 'ember';

export default Ember.Component.extend({
  tagName: "span",
  classNames: ['connection-icon'],
  connectionManager: Ember.inject.service('connection-manager'),
  flowPercent: 0
});
