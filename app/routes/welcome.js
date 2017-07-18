import Ember from 'ember';

export default Ember.Route.extend({

  actions: {
    goHome() {
      console.log("Transitioning to home");
      this.transitionTo('home');
    }
  }
});
