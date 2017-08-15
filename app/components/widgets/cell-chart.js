import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";


export default Ember.Component.extend({
    dataManager: Ember.inject.service('data-manager'),
    classNames:["cell-chart", "md-whiteframe-z1"],
    
    
    
    chart: {
        width: 10,
        height: 10
    },
    item: null,
    lastVoltageHash: "",
    
    didInsertElement() {
        this.resizeElements();
        
        if(this.get('item')){
            this.get('item').$().on('resizestop', () => {
                //handle resize
                
                Ember.run.later(() => {
                    this.resizeElements();
                }, 500);
            });
        } else {
            console.log("No grid item found");
        }
        //console.log(this.$().find('.chart-line'));
        if(this.$().find('.chart-bar').length > 0) {
            this.createChart();
            
            this.updateChart();
        }
        
    },
    
    createChart() {
        console.log("Creating cell chart");
        var chartCanvas = this.$().find('.chart-bar')[0].getContext('2d');
        //console.log(chartCanvas);
        this.chartObject = new Chart(chartCanvas, {
            type: 'bar',
            options: this.getOptions()
        });
    },
    
    getOptions() {
        var formatTempValue = function(value){
            return (Math.round(value * 10) / 10) + "°";
        }
        var formatVoltValue = function(value){
            return (Math.round(value * 100) / 100) + "v";
        }
        
        
        var newOptions =  {
            elements: {
                point: {
                    radius: 5
                }
            },
            //scaleOverride: true,
            legend: {
                display: (this.get('widget.grid.height') > 2 && this.get('widget.settings.showLabels')),
                display: true,
                position: 'bottom',
                labels: {
                    fontColor: this.get('showDarkTheme') ? 'white' : 'black',
                    fontSize: 10
                }
            },
            tooltips: {
                mode: 'nearest',
                intersect: true
            },
            animation : false,
            responsive: true,
            animateScale: true,
            scaleOverride: true,
            scaleBeginAtZero:true,
            showXLabels: 4,
            
            scales: {
                xAxes: [
                {
                    id: 'x-axis-1',
                    unitStepSize: 4,
                    //type:'linear',
                    //stacked: true,
                    ticks: {
                        display: (this.get('widget.grid.height') > 1 && this.get('widget.settings.showLabels')),
                        autoSkip: true,
                        autoSkipPadding: 23,
                        fontColor: this.get('showDarkTheme') ? 'white' : 'black',
                        stepSize: 4
                    }
                },
                {
                    id: 'x-axis-2',
                    stacked: true,
                    position: 'top',
                    display: false,
                    //categoryPercentage: 0.3,
                    type: 'linear',
                    gridLines: {
                        display: false
                    },
                    ticks: {
                        max: 3,
                        min: 0,
                        stepSize: 0.1,
                        autoStep: true
                    }
                }
                ],
                yAxes: [
                {
                    id: 'y-axis-1',
                    type: 'linear',
                    display: true,
                    //stacked: true,
                    position: 'left',
                    ticks: {
                        fontColor: this.get('showDarkTheme') ? 'white' : 'black',
                        callback:formatVoltValue,
                        //suggestedMin: 3.5,
                        //suggestedMax: 4.3,
                        autoSkip: true,
                        autoSkipPadding: 10,
                        beginAtZero: false,
                        stepSize: 0.02
                        //min: 2
                    }
                },
                {
                    id: 'y-axis-2',
                    type: 'linear',
                    display: true,
                    position: 'right',
                    gridLines: {
                        display: false
                    },
                    ticks: {
                        fontColor: this.get('showDarkTheme') ? 'white' : 'black',
                        callback:formatTempValue,
                        /*min: $localStorage.settings.experiance.tempUnits == "C" ? 0 : 20,
                        max: $localStorage.settings.experiance.tempUnits == "C" ? 55 : 120,
                        stepSize: 20*/
                    }
                }
                ]
            }
        };
        
        return newOptions;
    },
    
    updateChart: function() {
        //console.log("Updating time chart");
        var hash = (object) => { return btoa(JSON.stringify(object)) }
        
        if(this.chartObject && this.lastVoltageHash !== hash(this.get('dataManager').cellShunts) + hash(this.get('dataManager').cellTemps) +  hash(this.get('dataManager').cellVoltages)) {
            this.set('lastDataGraphed', this.get('dataManager').startTime);
            this.set('lastVoltageHash', this.lastVoltageHash !== hash(this.get('dataManager').cellShunts) + hash(this.get('dataManager').cellTemps) +  hash(this.get('dataManager').cellVoltages));
            
            var backgroundColors = [];
            var borderColors = [];
            
            var newTempData = {
                label: "Temperature",
                borderWidth: 3,
                data: [],
                backgroundColors: ["rgba(0,0,0,0)"],
                hoverBackgroundColors: ["rgba(255,99,132,0.4)"],
                hoverBorderColors: ["rgba(255,99,132,1)"],
                type: 'line',
                yAxisID: 'y-axis-2',
                xAxisID: 'x-axis-2'
            };
            
            if(this.get('dataManager').cellShunts.length > 0) {
                for(var i = 0; i < this.get('dataManager').cellShunts.length; i++) {
                    var shunting = this.get('dataManager').cellShunts.charAt(i);
                    if(shunting == "1") {
                        backgroundColors.push('rgba(150, 55, 232, 0.3)');
                        borderColors.push('rgba(150, 55, 232, 1)');
                    } else {
                        backgroundColors.push('rgba(98, 197, 15, 0.3)');
                        borderColors.push('rgba(98, 197, 15, 1)');
                    }
                }
            } else {
                backgroundColors.push("rgba(98, 197, 15, 0.3)");
                borderColors.push("rgba(98, 197, 15, 1)");
            }
            
            if(this.get('dataManager').cellTemps && this.get('dataManager').cellTemps.length >= 2) {
                
                for(let i = 0; i < this.get('dataManager').cellTemps.length; i++){
                    newTempData.data.push({x: i, y: this.get('dataManager').cellTemps[i]});
                } 
                //console.log("New temp Data", newTempData);
                
            }
            this.chartObject.data.datasets[1] = newTempData;
            
            var newData = {
                label: "Cell Voltage",
                borderWidth: 1,
                type: 'bar',
                data: [],
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                yAxisID: 'y-axis-1',
                xAxisID: 'x-axis-1'
            };
            var newLabels = [];
            
            if(this.get('dataManager').cellVoltages && this.get('dataManager').cellVoltages.length > 0){
                for(let i = 1; i < this.get('dataManager').cellVoltages.length + 1; i ++) {
                    var voltage = this.get('dataManager').cellVoltages[i];
                    if(voltage < 6) {
                        newLabels.push(i.toString());
                        newData.data.push(voltage);
                    }
                }
                //console.log("New cell Data", newData);
            } else {
                console.log("No cell voltages", this.get('dataManager').cellVoltages);
            }
            this.chartObject.data.datasets[0] = newData;
            
            this.chartObject.data.labels = newLabels;
            //this.chartObject.options = this.getOptions();
            //console.log($scope.data);
            //this.chartObject.redraw();
            //console.log("New time chart", this.chartObject);
            //console.log("Made it to the end of time chart rendering", newData);
            this.chartObject.update();
        } else {
            this.createChart();
        }
        //console.log("Updated chart");
    }.observes('dataManager.tripIndex'),
    
    resizeElements() {
        if(this.chartObject){
        
            this.set('chart', {
                width: this.$().width(),
                height: this.$().height()
            });
            //var containerWidth = (batteryCircle.getBoundingClientRect().width);
            
            //var chartCanvas = this.$().find('.chart-bar')[0].getContext('2d');
            //console.log(chartCanvas);
            /*this.chartObject.destroy();
            this.chartObject = new Chart(chartCanvas, {
                type: 'bar',
                options: this.getOptions()
            });*/
            console.log(this.get('widget.grid.height'));
            //this.chartObject.canvas.width = this.get('chart').width;
            //this.chartObject.canvas.height = this.get('chart').height;
            
            this.updateChart();
            //}, 300);*/
            //this.chartObject.render();
            
            //console.log(this.get('chart'));
        }
    }
});
