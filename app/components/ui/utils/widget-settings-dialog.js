import Ember from 'ember';

export default Ember.Component.extend({
    dataManager: Ember.inject.service('data-manager'),
    widgets: [],
    showDialog: false,
    widget: null,
    availableData: [],
    selectedData: null,

    shouldShowDialog: function(){
        if(this.get('showDialog')) {
            if(this.get('widget.type') == 'widgets/time-chart') {
                this.set('availableData', this.get('dataManager').availableData('number'));
            } else {
                this.set('availableData', this.get('dataManager').availableData());
            }
        }
    }.observes('showDialog'),

    didInsertElement() {
        this.set('selectedData', this.get('widget.bind')[0]);
    },

    updateWidget: function() {
        console.log("Did widget change?");
        this.get('widgets').replace(this.get('index'), 1, this.get('widget'));
    },

    actions: {
        closeDialog() {
            this.set('showDialog', false)
        },

        changeTime(value) {
            this.set('widget.settings.graphTimeEnd', value * 60000);
            console.log("Changing time to ", value);
        },

        toggleSetting(setting, value){
            this.toggleProperty(`widget.${setting}`, value);
            this.updateWidget();
        },

        selectSingleData(data) {
            console.log("Setting data to ", data);
            this.set('selectedData', data);
            this.set('widget.bind', [data]);
            this.updateWidget();
        },

        selectManyData(data, active) {
            console.log("Setting data to ", data, active);
            if(active) {
                this.get('widget.bind').addObject(data);
            } else {
                this.get('widget.bind').removeObject(data);
            }
            //this.set('widget.bind', [data]);
            this.updateWidget();
        }
    }
});
