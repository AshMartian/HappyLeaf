import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ["widget-options"],
    widgets: [],
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
            var grid = $('.grid-stack').data('gridstack');
            var parent = this.$().parents(".grid-stack-item")
            grid.movable(parent, !this.get('widget.grid.locked'));
            grid.resizable(parent, !this.get('widget.grid.locked'));
            //console.log(this.get('item'))
        }
    }
});
