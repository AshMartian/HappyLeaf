import Ember from 'ember';

export default Ember.Component.extend({
    widgets: [],
    classNames: ['new-widget'],
    //dataManager: Ember.inject.service('data-manager'),

    availableWidgets: [
        {
            name: 'WIDGETS.DATA_DISPLAY',
            icon: 'developer_board',
            template: {
                name: 'WIDGETS.DATA_DISPLAY',
                type: "widgets/data-display",
                rowspan: 1,
                colspan: 1,
                bind: [],
                settings: {},
                style: ""
            }
        },
        {
            name: 'WIDGETS.TIME_CHART',
            icon: 'show_chart',
            template: {
                name: 'WIDGETS.TIME_CHART',
                type: "widgets/time-chart",
                rowspan: 4,
                colspan: 6,
                bind: [],
                settings: {},
                style: ""
            }
        },
        {
            name: 'WIDGETS.REMAINING',
            icon: 'battery_full',
            template: {
                name: 'WIDGETS.REMAINING',
                type: "widgets/energy-remaining",
                bind: [],
                rowspan: 2,
                colspan: 3,
                settings: {},
                style: ""
            }
        },
        {
            name: 'WIDGETS.USED',
            icon: 'battery_charging_full',
            template: {
                name: 'WIDGETS.USED',
                type: "widgets/energy-used",
                bind: [],
                rowspan: 2,
                colspan: 3,
                settings: {},
                style: ""
            }
        },
        {
            name: 'WIDGETS.VOLTS',
            icon: 'equalizer',
            template: {
                name: 'WIDGETS.VOLTS',
                type: "widgets/cell-chart",
                bind: [],
                rowspan: 3,
                colspan: 8,
                settings: {},
                style: ""
            }
        },
        {
            name: 'WIDGETS.LEAF_DISPLAY',
            icon: 'directions_car',
            template: {
                name: 'WIDGETS.LEAF_DISPLAY',
                type: "widgets/leaf-display",
                bind: [],
                rowspan: 4,
                colspan: 3,
                settings: {},
                style: ""
            }
        },
        {
            name: 'WIDGETS.LOG_VIEW',
            icon: 'code',
            template: {
                name: 'WIDGETS.LOG_VIEW',
                type: "widgets/log-view",
                bind: [],
                rowspan: 4,
                colspan: 3,
                settings: {},
                style: ""
            }
        }
    ],

    updatedWidgets: function() {
        
    }.observes('widgets.@each'),

    didInsertElement() {
        this.updatedWidgets();
    }, 

    actions: {
        addWidget(widget) {
            //console.log("Adding widget ", widget);
            //console.log(this.get('dataManager').availableData());
            var newWidget = Ember.copy(widget);
            var newGrid = {
                width: newWidget.colspan,
                height: newWidget.rowspan,
                locked: false,
                y: 10 + Math.round(this.get('widgets').length / 1.5),
                x: 0,
            };
            newWidget.grid = newGrid;
            //console.log(newWidget);
            this.get('widgets').addObject(Ember.Object.create(newWidget));
        }
    }
});
