import Ember from 'ember';
import subscribe from 'ember-cordova-events/utils/subscribe';

export default Ember.Component.extend({
    sideNavOpen: false,
    dataManager: Ember.inject.service('data-manager'),
    connectionManager: Ember.inject.service('connection-manager'),

    tripDuration: Ember.computed('dataManager.startTime', function(){
        var ms = moment(this.get('dataManager').wattsStartedTime).diff(moment(this.get('dataManager').startTime));
        return moment.duration(ms).humanize();
    }),

    backPressed: subscribe('cordovaEvents.backbutton', () => {
        this.send('toggleSide');
    }),

    actions: {
        openNav() {
            this.set('sideNavOpen', true);
        },
        toggleSide(e) {
            console.log(e);
            this.toggleProperty('sideNavOpen');
        },

        goWelcome() {
            this.sendAction('goWelcome');
        },

        resetTrip() {
            this.get('dataManager').setWattsWatcher();
        }
    }
});
