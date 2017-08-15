import StorageObject from 'ember-local-storage/local/array';

const Storage = StorageObject.extend();

// Uncomment if you would like to set initialState
 Storage.reopenClass({
   initialState() {
     return [[{"name":"WIDGETS.LEAF_DISPLAY","type":"widgets/leaf-display","rowspan":4,"colspan":4,"bind":[],"settings":{},"grid":{"x":0,"y":0,"height":4,"width":3,"locked":false},"style":""},{"name":"WIDGETS.REMAINING","type":"widgets/energy-remaining","rowspan":2,"colspan":3,"bind":[],"settings":{},"grid":{"x":4,"y":0,"height":2,"width":3,"locked":false},"style":""},{"name":"WIDGETS.USED","type":"widgets/energy-used","rowspan":2,"colspan":3,"bind":[],"settings":{"distancePer":true},"grid":{"x":7,"y":0,"height":2,"width":3,"locked":false},"style":""},{"name":"WIDGETS.TIME_CHART","type":"widgets/time-chart","rowspan":4,"colspan":6,"bind":["actualSOC","averageSpeed","averageMotorWatts","averageRegenWatts","averageClimateUsage"],"settings":{"showLabels":true,"graphTimeEnd":1800000},"grid":{"x":4,"y":2,"height":4,"width":6,"locked":false},"style":""},{"name":"WIDGETS.DATA_DISPLAY","type":"widgets/data-display","rowspan":1,"colspan":1,"bind":["odometer"],"settings":{},"style":"","grid":{"x":3,"y":1,"height":1,"width":1,"locked":false}},{"name":"WIDGETS.DATA_DISPLAY","type":"widgets/data-display","rowspan":1,"colspan":1,"bind":["outsideTemp"],"settings":{},"style":"","grid":{"x":3,"y":0,"height":1,"width":1,"locked":false}},{"name":"WIDGETS.DATA_DISPLAY","type":"widgets/data-display","rowspan":1,"colspan":1,"bind":["speed"],"settings":{},"style":"","grid":{"x":3,"y":2,"height":1,"width":1,"locked":false}},{"name":"WIDGETS.DATA_DISPLAY","type":"widgets/data-display","rowspan":1,"colspan":1,"bind":["capacityAH"],"settings":{},"style":"","grid":{"x":3,"y":3,"height":1,"width":1,"locked":false}},{"name":"WIDGETS.TIME_CHART","type":"widgets/time-chart","rowspan":4,"colspan":6,"bind":["hx"],"settings":{"graphTimeEnd":29460000},"style":"","grid":{"x":0,"y":4,"height":1,"width":3,"locked":false}},{"name":"WIDGETS.DATA_DISPLAY","type":"widgets/data-display","rowspan":1,"colspan":1,"bind":["hx"],"settings":{},"style":"","grid":{"x":3,"y":4,"height":1,"width":1,"locked":false}},{"name":"WIDGETS.TIME_CHART","type":"widgets/time-chart","rowspan":4,"colspan":6,"bind":["tireDelta"],"settings":{"graphTimeEnd":29460000},"style":"","grid":{"x":0,"y":5,"height":1,"width":3,"locked":false}},{"name":"WIDGETS.DATA_DISPLAY","type":"widgets/data-display","rowspan":1,"colspan":1,"bind":["tireDelta"],"settings":{},"style":"","grid":{"x":3,"y":5,"height":1,"width":1,"locked":false}},{"name":"WIDGETS.VOLTS","type":"widgets/cell-chart","bind":[],"rowspan":3,"colspan":8,"settings":{},"style":"","grid":{"x":0,"y":6,"height":3,"width":10,"locked":false}}],[{"name":"WIDGETS.LEAF_DISPLAY","type":"widgets/leaf-display","rowspan":4,"colspan":4,"bind":[],"settings":{},"grid":{"x":0,"y":0,"height":3,"width":2,"locked":false},"style":""},{"name":"WIDGETS.REMAINING","type":"widgets/energy-remaining","rowspan":2,"colspan":3,"bind":[],"settings":{},"grid":{"x":2,"y":0,"height":1,"width":2,"locked":false},"style":""},{"name":"WIDGETS.USED","type":"widgets/energy-used","rowspan":2,"colspan":3,"bind":[],"settings":{"distancePer":true},"grid":{"x":4,"y":0,"height":1,"width":2,"locked":false},"style":""},{"name":"WIDGETS.TIME_CHART","type":"widgets/time-chart","rowspan":4,"colspan":6,"bind":["actualSOC","averageSpeed","averageMotorWatts","averageRegenWatts","averageClimateUsage"],"settings":{"showLabels":true,"graphTimeEnd":1800000},"grid":{"x":2,"y":1,"height":3,"width":4,"locked":false},"style":""},{"name":"WIDGETS.DATA_DISPLAY","type":"widgets/data-display","rowspan":1,"colspan":1,"bind":["speed"],"settings":{},"style":"","grid":{"x":0,"y":3,"height":1,"width":1,"locked":false}},{"name":"WIDGETS.DATA_DISPLAY","type":"widgets/data-display","rowspan":1,"colspan":1,"bind":["capacityAH"],"settings":{},"style":"","grid":{"x":1,"y":3,"height":1,"width":1,"locked":false}},{"name":"WIDGETS.VOLTS","type":"widgets/cell-chart","bind":[],"rowspan":3,"colspan":8,"settings":{},"style":"","grid":{"x":0,"y":4,"height":2,"width":6,"locked":false}}],[{"name":"WIDGETS.LEAF_DISPLAY","type":"widgets/leaf-display","rowspan":4,"colspan":4,"bind":[],"settings":{},"grid":{"x":0,"y":0,"height":3,"width":2,"locked":false},"style":""},{"name":"WIDGETS.REMAINING","type":"widgets/energy-remaining","rowspan":2,"colspan":3,"bind":[],"settings":{},"grid":{"x":0,"y":3,"height":1,"width":2,"locked":false},"style":""},{"name":"WIDGETS.USED","type":"widgets/energy-used","rowspan":2,"colspan":3,"bind":[],"settings":{"distancePer":true},"grid":{"x":0,"y":4,"height":1,"width":2,"locked":false},"style":""},{"name":"WIDGETS.TIME_CHART","type":"widgets/time-chart","rowspan":4,"colspan":6,"bind":["actualSOC","averageSpeed","averageMotorWatts","averageRegenWatts","averageClimateUsage"],"settings":{"showLabels":true,"graphTimeEnd":1800000},"grid":{"x":0,"y":5,"height":4,"width":3,"locked":false},"style":""},{"name":"WIDGETS.VOLTS","type":"widgets/cell-chart","bind":[],"rowspan":3,"colspan":8,"settings":{},"style":"","grid":{"x":0,"y":9,"height":4,"width":3,"locked":false}},{"name":"WIDGETS.DATA_DISPLAY","type":"widgets/data-display","rowspan":1,"colspan":1,"bind":["odometer"],"settings":{},"style":"","grid":{"x":2,"y":0,"height":1,"width":1,"locked":false}},{"name":"WIDGETS.DATA_DISPLAY","type":"widgets/data-display","rowspan":1,"colspan":1,"bind":["hx"],"settings":{},"style":"","grid":{"x":2,"y":2,"height":1,"width":1,"locked":false}},{"name":"WIDGETS.DATA_DISPLAY","type":"widgets/data-display","rowspan":1,"colspan":1,"bind":["speed"],"settings":{},"style":"","grid":{"x":2,"y":1,"height":1,"width":1,"locked":false}},{"name":"WIDGETS.DATA_DISPLAY","type":"widgets/data-display","rowspan":1,"colspan":1,"bind":["capacityAH"],"settings":{},"style":"","grid":{"x":2,"y":3,"height":1,"width":1,"locked":false}},{"name":"WIDGETS.DATA_DISPLAY","type":"widgets/data-display","rowspan":1,"colspan":1,"bind":["tireDelta"],"settings":{},"style":"","grid":{"x":2,"y":4,"height":1,"width":1,"locked":false}}]];
     /*[[{
       name: "WIDGETS.LEAF_DISPLAY",
       type: "widgets/leaf-display",
       rowspan: 4,
       colspan: 4,
       bind: [],
       settings: {},
       grid: {
        width: 4,
        height: 4,
        x: 0,
        y: 0,
        locked: false
       },
       style: ""
     }, {
       name: 'WIDGETS.REMAINING',
       type: "widgets/energy-remaining",
       rowspan: 2,
       colspan: 3,
       bind: [],
       settings: {
         
       },
       grid: {
        width: 3,
        height: 2,
        x: 4,
        y: 0,
        locked: false
       },
       style: ""
     },{
       name: "WIDGETS.USED",
       type: "widgets/energy-used",
       rowspan: 2,
       colspan: 3,
       bind: [],
       settings: {
         distancePer: true
       },
       grid: {
        width: 3,
        height: 2,
        x: 7,
        y: 0,
        locked: false
       },
       style: ""
     },{
       name: "WIDGETS.TIME_CHART",
       type: "widgets/time-chart",
       rowspan: 4,
       colspan: 6,
       bind: ["actualSOC", "averageSpeed", "averageMotorWatts", "averageRegenWatts", "averageClimateUsage"],
       settings: {
         showLabels: true
       },
       grid: {
        width: 6,
        height: 4,
        x: 4,
        y: 2,
        locked: false
       },
       style: ""
     }], [{
       name: "WIDGETS.LEAF_DISPLAY",
       type: "widgets/leaf-display",
       rowspan: 4,
       colspan: 4,
       bind: [],
       settings: {},
       grid: {
        width: 4,
        height: 4,
        x: 0,
        y: 0,
        locked: false
       },
       style: ""
     }, {
       name: 'WIDGETS.REMAINING',
       type: "widgets/energy-remaining",
       rowspan: 2,
       colspan: 3,
       bind: [],
       settings: {
         
       },
       grid: {
        width: 3,
        height: 2,
        x: 4,
        y: 4,
        locked: false
       },
       style: ""
     },{
       name: "WIDGETS.USED",
       type: "widgets/energy-used",
       rowspan: 2,
       colspan: 3,
       bind: [],
       settings: {
         distancePer: true
       },
       grid: {
        width: 3,
        height: 2,
        x: 7,
        y: 4,
        locked: false
       },
       style: ""
     },{
       name: "WIDGETS.TIME_CHART",
       type: "widgets/time-chart",
       rowspan: 4,
       colspan: 6,
       bind: ["actualSOC", "averageSpeed", "averageMotorWatts", "averageRegenWatts", "averageClimateUsage"],
       settings: {
         showLabels: true
       },
       grid: {
        width: 6,
        height: 4,
        x: 4,
        y: 2,
        locked: false
       },
       style: ""
     }],[{
       name: "WIDGETS.LEAF_DISPLAY",
       type: "widgets/leaf-display",
       rowspan: 4,
       colspan: 4,
       bind: [],
       settings: {},
       grid: {
        width: 4,
        height: 4,
        x: 0,
        y: 0,
        locked: false
       },
       style: ""
     }, {
       name: 'WIDGETS.REMAINING',
       type: "widgets/energy-remaining",
       rowspan: 2,
       colspan: 3,
       bind: [],
       settings: {
         
       },
       grid: {
        width: 3,
        height: 2,
        x: 4,
        y: 4,
        locked: false
       },
       style: ""
     },{
       name: "WIDGETS.USED",
       type: "widgets/energy-used",
       rowspan: 2,
       colspan: 3,
       bind: [],
       settings: {
         distancePer: true
       },
       grid: {
        width: 3,
        height: 2,
        x: 7,
        y: 4,
        locked: false
       },
       style: ""
     },{
       name: "WIDGETS.TIME_CHART",
       type: "widgets/time-chart",
       rowspan: 4,
       colspan: 6,
       bind: ["actualSOC", "averageSpeed", "averageMotorWatts", "averageRegenWatts", "averageClimateUsage"],
       settings: {
         showLabels: true
       },
       grid: {
        width: 6,
        height: 4,
        x: 4,
        y: 2,
        locked: false
       },
       style: ""
     }]];*/
   }
 });

export default Storage;
