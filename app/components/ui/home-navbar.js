import Ember from 'ember';

export default Ember.Component.extend({
    dataManager: Ember.inject.service('data-manager'),
    openNav: false,
    homeLocked: null,
    actions: {
        openNav(){
            this.toggleProperty('openNav');
            console.log("open nav", this.get('openNav'));
        },

        toggleLocked() {
            this.toggleProperty('homeLocked');
        }
    }
});
