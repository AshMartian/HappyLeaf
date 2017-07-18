import Ember from 'ember';
import { storageFor } from 'ember-local-storage';

export default Ember.Component.extend({
    classNames: ["widget-options"],
    widgets: storageFor('widgets'),
    widget: null,
    index: 0,
    item: 0,
    showDialog: false,

    didInsertElement() {
        
    },

    actions: {
        deleteWidget() {
            //console.log("I'm about to be deleted at index ", this.get('index'));
            this.get('widgets').removeObject(this.get('widget'));
        },
        editWidget() {
            this.set('showDialog', true);
        },
        lockWidget(){
            this.toggleProperty('widget.grid.locked');
            //console.log(this.get('item'))
        }
    }
});
