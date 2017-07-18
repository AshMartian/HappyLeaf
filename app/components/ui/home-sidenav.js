import Ember from 'ember';

export default Ember.Component.extend({
    sideNavOpen: false,
    dataManager: Ember.inject.service('data-manager'),

    tripDuration: Ember.computed('dataManager.startTime', function(){
        var ms = moment(this.get('dataManager').wattsStartedTime).diff(moment(this.get('dataManager').startTime));
        return moment.duration(ms).humanize();
    }),

    actions: {
        openNav() {
            this.set('sideNavOpen', true);
        },
        toggleSide(e) {
            console.log(e);
            this.toggleProperty('sideNavOpen');
        },

        resetTrip() {
            this.get('dataManager').setWattsWatcher();
        }
    }
});
