import Ember from 'ember';

export default Ember.Controller.extend({
    connectionManager: Ember.inject.service('connection-manager'),
    flowManager: Ember.inject.service('flow-manager'),
    actions: {
        goWelcome:function() {
            //console.log("Transitioning to welcome", this.get('target'));
            this.set('flowManager.currentRequest', "");
            this.get('connectionManager').subscribe((output, request) => {
                
            });
            this.get('target').transitionTo('welcome');
        }
    }
});
