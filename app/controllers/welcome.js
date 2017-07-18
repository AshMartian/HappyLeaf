import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    goHome:function() {
      console.log("Transitioning to home", this.get('target'));
      this.get('target').transitionTo('home');
    }
  }
});
