import Ember from 'ember';

export default Ember.Component.extend({
    widgets: [],
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
        }
    ],

    updatedWidgets: function() {
        let leafTemplate = {
            name: 'WIDGETS.LEAF_DISPLAY',
            icon: 'directions_car',
            template: {
                name: 'WIDGETS.LEAF_DISPLAY',
                type: "widgets/leaf-display",
                bind: [],
                rowspan: 6,
                colspan: 4,
                settings: {},
                style: ""
            }
        };

        let logTemplate = {
            name: 'WIDGETS.LOG_VIEW',
            icon: 'code',
            template: {
                name: 'WIDGETS.LOG_VIEW',
                type: "widgets/log-view",
                bind: [],
                rowspan: 3,
                colspan: 3,
                settings: {},
                style: ""
            }
        };

        //console.log("Widgets length changed");
        Ember.run.later(() => {
            if($("#LEAF").length == 0) {
                this.get('availableWidgets').addObject(leafTemplate);
            } else {
                this.get('availableWidgets').removeObject(leafTemplate);
            }

            if($(".log-container").length == 0) {
                this.get('availableWidgets').addObject(logTemplate);
            } else {
                this.get('availableWidgets').removeObject(logTemplate);
            }
        }, 5000);
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
                y: Math.round(this.get('widgets.content').length / 1.5),
                x: 0,
            };
            newWidget.grid = newGrid;
            //console.log(newWidget);
            this.get('widgets').addObject(Ember.Object.create(newWidget));
        }
    }
});
