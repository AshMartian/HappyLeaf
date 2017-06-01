happyLeaf.component('largeArrayChart', {
  templateUrl:'components/large-array-chart-widget.html',

  bindings:{
    showDarkTheme: "="
  },

  controller: function($scope, $rootScope, storageManager, $localStorage, dataManager){
    var chartObject = null;
    $scope.local = $localStorage;
    var self = this;
    $scope.dataManager = dataManager;
    $scope.showDarkTheme = self.showDarkTheme;

    $scope.$watch('$ctrl.showDarkTheme', function(){
      calculateOptions();
    });

    $(window).resize(function(){
      $scope.needsResize = true;
      $scope.updateChart();
    });

    $scope.series = ["Cell"];
    $scope.labels = ["1", "2", "3", "4", "5"];
    $scope.data = [[4.01, 4.02, 3.98, 3.85, 3.9], [{x: 0, y:44}, {x: 1, y:50}, {x: 2, y: 40}, {x: 3, y: 56}]];

    $scope.$on('chart-create', function (evt, chart) {
      chartObject = chart;
      setTimeout(function(){
        $scope.updateChart();
      }, 250);
    });

    $rootScope.$on('dataUpdate:Volts', function(){
      //console.log(dataManager.cellVoltages);

      $scope.updateChart();
    });

    $rootScope.$on('dataUpdate:Temps', function(){

      $scope.updateChart();
    });

    $scope.updateChart = function(force){
      if(dataManager.cellTemps && dataManager.cellTemps.length >= 2) {
        var newData = [];
        for(var i = 0; i < dataManager.cellTemps.length; i++){
          newData.push({x: i, y: dataManager.cellTemps[i]});
        }
        $scope.data[1] = newData;
      }

      if(dataManager.cellVoltages && dataManager.cellVoltages.length > 0){
        var newLabels = [];
        for(var i = 1; i < dataManager.cellVoltages.length + 1; i ++) {
          newLabels.push(i.toString());
        }
        $scope.data[0] = dataManager.cellVoltages;
        $scope.labels = newLabels;
      }
      //console.log($scope.labels);

      if(chartObject && chartObject !== undefined) {
        //chartObject.redraw();
        chartObject.render();
      }
    };

    var calculateOptions = function(){

      $scope.datasetOverride = [{
          label: "Cell Voltage",
          borderWidth: 1,
          type: 'bar',
          yAxisID: 'y-axis-1',
          xAxisID: 'x-axis-1'
        },
        {
          label: "Temperature",
          borderWidth: 3,
          backgroundColor: "rgba(0,0,0,0)",
          hoverBackgroundColor: "rgba(255,99,132,0.4)",
          hoverBorderColor: "rgba(255,99,132,1)",
          type: 'line',
          yAxisID: 'y-axis-2',
          xAxisID: 'x-axis-2'
        }
      ]

      $scope.options = {
        elements: {
            point: {
                radius: 5
            }
        },
        //scaleOverride: true,
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            fontColor: self.showDarkTheme ? 'white' : 'black',
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
        scaleBeginAtZero:false,
        showXLabels: 4,

        scales: {
          xAxes: [
            {
              id: 'x-axis-1',
              unitStepSize: 4,
              //type:'linear',
              //stacked: true,
              ticks: {
                autoSkip: true,
                autoSkipPadding: 23,
                fontColor: self.showDarkTheme ? 'white' : 'black',
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
                fontColor: self.showDarkTheme ? 'white' : 'black',
                callback:formatVoltValue,
                //suggestedMin: 3.5,
                //suggestedMax: 4.3,
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
                fontColor: self.showDarkTheme ? 'white' : 'black',
                callback:formatTempValue,
                /*min: $localStorage.settings.experiance.tempUnits == "C" ? 0 : 20,
                max: $localStorage.settings.experiance.tempUnits == "C" ? 55 : 120,
                stepSize: 20*/
              }
            }
          ]
        }
      }
    };
    calculateOptions();

    var formatTempValue = function(value){
      return value + "°";
    }
    var formatVoltValue = function(value){
      return (Math.round(value * 100) / 100) + "v";
    }
  }
});
