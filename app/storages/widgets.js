import StorageArray from 'ember-local-storage/local/array';

const Storage = StorageArray.extend();

// Uncomment if you would like to set initialState
 Storage.reopenClass({
   initialState() {
     return [{
       name: "WIDGETS.LEAF_DISPLAY",
       type: "widgets/leaf-display",
       rowspan: 6,
       colspan: 4,
       bind: [],
       settings: {},
       grid: {
        width: 4,
        height: 6,
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
       settings: {},
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
       settings: {},
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
     }];
   }
 });

export default Storage;
