import Ember from 'ember';

export default Ember.Route.extend({

    actions: {
        goWelcome() {
            console.log("Transitioning to welcome");
            this.transitionTo('welcome');
        }
    }
});
