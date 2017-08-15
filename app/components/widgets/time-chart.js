import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";

var defaultColors = [{ //What a pain in the A$$
    pointBorderColor: 'transparent',
    pointBackgroundColor: "#62c50f",
    borderColor: "#62c50f",
    backgroundColor: "rgba(98, 197, 15, 0.2)",
    fill: "#62c50f"
},{
    pointBorderColor: 'transparent',
    pointBackgroundColor: "#3785e8",
    borderColor: "#3785e8",
    backgroundColor: "rgba(55, 133, 232, 0.06)",
    fill: "rgba(55, 133, 232, 0.06)"
},{
    pointBorderColor: 'transparent',
    pointBackgroundColor: "#d45e55",
    borderColor: "#d45e55",
    backgroundColor: "rgba(212, 94, 85, 0.3)",
    fill: "#d45e55"
},{
    pointBorderColor: 'transparent',
    pointBackgroundColor: "#9637e8",
    borderColor: "#9637e8",
    backgroundColor: "rgba(150, 55, 232, 0.3)",
    fill: "#9637e8"
},{
    pointBorderColor: 'transparent',
    pointBackgroundColor: "#37e8d2",
    borderColor: "#37e8d2",
    backgroundColor: "rgba(55, 232, 210, 0.3)",
    fill: "#37e8d2"
}];

export default Ember.Component.extend({
  classNames:["time-chart", "md-whiteframe-z1"],
  i18n: Ember.inject.service(),
  dataManager: Ember.inject.service('data-manager'),
  

  chart: {
    width: 10,
    height: 10
  },
  item: null,

  didInsertElement() {
    this.resizeElements();

    if(this.get('item')){
      this.get('item').$().on('resizestop', () => {
          //handle resize
          //console.log("resize!");
          Ember.run.later(() => {
            this.resizeElements();
          }, 500);
      });
    } else {
      console.log("no grid item");
    }
    //console.log(this.$().find('.chart-line'));
    if(this.$().find('.chart-line').length > 0) {
      this.createChart();

      this.updateChart();
    }

  },

  createChart() {
    var originalLineDraw = Chart.controllers.line.prototype.draw;
    Chart.helpers.extend(Chart.controllers.line.prototype, {
      draw: function() {
        originalLineDraw.apply(this, arguments);

        var chart = this.chart;
        var ctx = chart.chart.ctx;

        var xaxis = chart.scales['x-axis-0'];
        var yaxises = Object.keys(chart.scales).map(function(key) {
            return chart.scales[key];
        });
        var yaxis = yaxises[1];

        var index = chart.config.data.lineAtIndex;
        if (index) {
          // console.log(yaxis)
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(xaxis.getPixelForValue(undefined, index), yaxis.top);
          ctx.strokeStyle = '#ff0000';
          ctx.lineTo(xaxis.getPixelForValue(undefined, index), yaxis.bottom);
          ctx.stroke();
          ctx.restore();
        }
        var indecies = chart.config.data.linesAtIndecies;
        if (indecies) {
          indecies.forEach(function(blueIndex){
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(xaxis.getPixelForValue(undefined, blueIndex), yaxis.top);
            ctx.strokeStyle = '#3f51b5';
            ctx.lineTo(xaxis.getPixelForValue(undefined, blueIndex), yaxis.bottom);
            ctx.stroke();
            ctx.restore();
          });
          
        }
      }
    });
  

    var chartCanvas = this.$().find('.chart-line')[0].getContext('2d');
    //console.log(chartCanvas);
    this.chartObject = new Chart(chartCanvas, {
      type: 'line',
      options: this.getOptions()
    });

  },

  getOptions() {
    var formatKwValue = function(value){
      return Math.round(value / 1000) + "kW";
    }
    var newOptions =  {
      elements: {
          point: {
              radius: 2
          }
      },
      scaleOverride: true,
      responsive: true,
      legend: {
        display: (this.get('widget.grid.height') > 2 && this.get('widget.settings.showLabels')),
        position: 'bottom',
        labels: {
          fontColor: this.get('showDarkTheme') ? 'white' : 'black',
          fontSize: 10
        }
      },
      animation : false,
      animateScale: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [
          {
            ticks: {
              display: (this.get('widget.grid.height') > 1 && this.get('widget.settings.showLabels')),
              fontColor: this.get('showDarkTheme') ? 'white' : 'black',
              autoSkip: true,
              autoSkipPadding: 20,
            },
            gridLines: {
              display: (this.get('widget.grid.width') > 3 && this.get('widget.settings.showLabels'))
            }
          }
        ],
        yAxes: [
          {
            id: 'y-axis-2',
            type: 'linear',
            display: true,
            position: 'right',
            ticks: {
              display: (this.get('widget.grid.width') > 2),
              fontColor: this.get('showDarkTheme') ? 'white' : 'black',
            }
          }
        ]
      }
    };
    if(JSON.stringify(this.get('widget.bind')).match(/wat|kw|regen|climate/i)) {
      newOptions.scales.yAxes.push({
        id: 'y-axis-1',
        type: 'linear',
        display: true,
        position: 'left',
        ticks: {
          fontColor: this.get('showDarkTheme') ? 'white' : 'black',
          callback:formatKwValue
        }
      });
    }

    return newOptions;
  },

  updateChart: function() {
   //console.log("Updating time chart");

    
    if(this.chartObject) {
      this.set('lastDataGraphed', this.get('dataManager').startTime);
      
        //$localStorage.settings.data.dataAttributes = ["actualSOC", "averageSpeed", "averageMotorWatts", "averageRegen", "averageClimateUsage"];
      //this.chartObject.data.dataset = [{ yAxisID: 'y-axis-2' }, { yAxisID: 'y-axis-2' }, { yAxisID: 'y-axis-1' }];

      var newLabels = [];
      var newData  = [];
      this.get('widget').bind.forEach((dataAttribute, index) => {
        newData.push({
          data: [],
          label: this.get('i18n').t('DATA.' + dataAttribute).toString(),
          yAxisID: (dataAttribute.match(/wat|kw|regen|climate/i)) ? 'y-axis-1' : 'y-axis-2'
        });
        newData[index] = Object.assign(newData[index], defaultColors[index]);
      });

      //console.log("New data created", newData);

      //console.log("About to generate chart using " + Object.keys($localStorage.history).length + " enteries");


      

      if(!this.get('widget.settings.graphTimeEnd')) {
        this.set('widget.settings.graphTimeEnd', 1800000);
      }

      var now = (new Date()).getTime();
      var tripStore = this.get('dataManager').getTrip();
      if(tripStore && Object.keys(tripStore).length === 0) {
        return;
      }
      var dataPointsToShow = [];
      Object.keys(tripStore).forEach((key) => { //This is nice, but data looks inconssitent.
        var historyDataPoint = tripStore[key];
        if(historyDataPoint.startTime && parseInt(historyDataPoint.startTime) > this.get('dataManager').startTime - this.get('widget').settings.graphTimeEnd && parseInt(historyDataPoint.startTime) < this.get('dataManager').startTime + this.get('widget').settings.graphTimeEnd) { // &&
          dataPointsToShow.push(historyDataPoint);
        }
      });
      //console.log("Data points to show", dataPointsToShow, this.get('widget').settings);
      var timeOffset = 1;
      var width = this.$().width() / 3.5; // 3.5 is arbritrary..
      if(dataPointsToShow.length > width) {
        timeOffset = 1 + (dataPointsToShow.length / width);
      }
      var timeDifference = timeOffset * 29999;

      /* Overly complex, doesn't seem to make good graphs
      if($localStorage.historyCount > 100) {
        var relaventHistory = 0;
        var historyKeys = Object.keys($localStorage.history);
        for(var i = 0; i < $localStorage.historyCount; i++){
          if(historyKeys[i] >= now - $localStorage.settings.data.dataTimeEnd){
            relaventHistory = i;
            break;
          }
        }

        timeDifference = parseInt(historyKeys[$localStorage.historyCount - 1]) - parseInt(historyKeys[relaventHistory]);
      }*/


      //console.log("Time difference " + timeDifference * 300);
      var lastDataAdded = {startTime: 0};

      this.chartObject.config.options = this.getOptions();
      this.chartObject.data.linesAtIndecies = [];

      var timeDataManager = this.get('dataManager').startTime;
      dataPointsToShow.forEach((historyDataPoint, index) => {
        if(historyDataPoint.wattsStarted !== lastDataAdded.wattsStarted) {
          this.chartObject.data.linesAtIndecies.push(newData[0].data.length - 1);
        }
        if(historyDataPoint.startTime > lastDataAdded.startTime){
          lastDataAdded = historyDataPoint;
          var dataPointsToAdd = [];
          this.get('widget').bind.forEach(function(seriesTitle){
            if(historyDataPoint[seriesTitle] !== null) {
              dataPointsToAdd.push(historyDataPoint[seriesTitle]);
            } else {
              dataPointsToAdd.push(0);
            }
          });

          if(dataPointsToAdd.length == this.get('widget').bind.length) {
            dataPointsToAdd.forEach(function(dataPoint, index){
              newData[index].data.push(dataPoint);
            });
            newLabels.push(moment(historyDataPoint.startTime).from(moment(timeDataManager), true).replace(' ago', '').replace('a few ', '').replace('hour', 'hr').replace('minute', 'min').replace('second', 'sec'));
          }
        }
        
        if(historyDataPoint.startTime == timeDataManager && newData[0] && newData[0].data) {
          this.chartObject.data.lineAtIndex = newData[0].data.length - 1;
          //console.log("Found current position at index ", index);
        }
        //newLabels.push(moment(historyDataPoint));
      });

      this.chartObject.data.labels = newLabels;
      this.chartObject.data.datasets = newData;
      //console.log($scope.data);
        //this.chartObject.redraw();
        //console.log("New time chart", this.chartObject);
      //console.log("Made it to the end of time chart rendering", newData);
      this.chartObject.update();
    } else {
      this.createChart();
    }
  }.observes('dataManager.tripIndex', 'widget.settings'),

  resizeElements() {
    this.set('chart', {
      width: this.$().width(),
      height: this.$().height()
    });
    if(this.chartObject){
      
      //var containerWidth = (batteryCircle.getBoundingClientRect().width);
      var chartCanvas = this.$().find('.chart-line')[0].getContext('2d');
      this.chartObject.destroy();
      this.chartObject = new Chart(chartCanvas, {
        type: 'line',
        options: this.getOptions()
      });
      //console.log(this.get('widget.grid.height'));
      //this.chartObject.canvas.width = this.get('chart').width;
      //this.chartObject.canvas.height = this.get('chart').height;
      this.updateChart();
      //this.chartObject.render();
      
      //console.log(this.get('chart'));
    }
  }
});
