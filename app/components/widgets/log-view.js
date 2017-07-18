import Ember from 'ember';

export default Ember.Component.extend({
    classNames:["data", "md-whiteframe-z1"],
    logManager: Ember.inject.service('log-manager'),

    logText: "",
    logPlaying: false,

    didInsertElement() {
        setInterval(() => {
            if(this.get('logPlaying')) {
                this.set('logText', this.get('logManager').logText);
            }
        }, 750);
    },

    actions: {
        togglePlaying() {
            this.toggleProperty('logPlaying');
        }
    }
});
