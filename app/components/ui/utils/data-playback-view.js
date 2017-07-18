import Ember from 'ember';

export default Ember.Component.extend({
    dataManager: Ember.inject.service('data-manager'),
    classNames: ["playback-view flex"],
    isPlaying: false,

    playInterval: 500,
    playTimer: null,

    observePlaying: function(){
        if(this.get('isPlaying')) {
            this.set('playTimer', setInterval(() => {
                //console.log("Advancing trip");
                this.set('dataManager.tripIndex', this.get('dataManager.tripIndex') + 1);
            }, this.get('playInterval')));
        } else {
            clearInterval(this.get('playTimer'));
        }
    }.observes('isPlaying'),

    actions: {
        togglePlaying() {
            this.toggleProperty('isPlaying');
        }, 
        setIndex(what, index) {
            //console.log(this.get("dataManager.tripCount"));
            this.set('dataManager.tripIndex', index);
            //console.log(index);
        }
    }
});
