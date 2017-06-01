happyLeaf.component('largeTimeChart', {

    // Inline template which is binded to message variable
    // in the component controller
    templateUrl:'components/large-time-chart-widget.html',
    displayStyle: 'background-color: black;',

    bindings:{
      showDarkTheme: "="
    },

    controller: function($scope, $rootScope, storageManager, $localStorage, dataManager){
      $scope.local = $localStorage;
      $scope.lastDataGraphed = null;
      var chartObject = null;
      var self = this;

      $scope.showDarkTheme = self.showDarkTheme;
      $scope.$watch('$ctrl.showDarkTheme', function(){
        calculateOptions();
      })

      $scope.isCharging = dataManager.isCharging;

      $scope.menuOptions = [{
        title: "reset",
        icon: "cached",
        clicked: function(){
          dataManager.setWattsWatcher();
        }
      }];

      if($localStorage.settings.data.chargingDataAttributes){
        $scope.series = $localStorage.settings.data.chargingDataAttributes;
      } else {
        $localStorage.settings.data.drivingDataAttributes = ["actualSOC", "averageSpeed", "averageMotorWatts", "averageRegen", "averageClimateUsage"];
        $localStorage.settings.data.chargingDataAttributes = ["actualSOC", "chargingWatts", "averageClimateUsage", "hx"];
      }

      $scope.labels = [];
      if(!$localStorage.settings.data.colors){
        $localStorage.settings.data.colors = [{ //What a pain in the A$$
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
    }

    $scope.$on('chart-create', function (evt, chart) {
      chartObject = chart;
      setTimeout(function(){
        $scope.updateChart();
      }, 250);
    });


      $(window).resize(function(){
        $scope.needsResize = true;
        $scope.updateChart();
      });

      var chargingOverride = false;

      $scope.toggleCharging = function(){
        if($scope.isCharging){
          $scope.isCharging = false;
        } else {
          $scope.isCharging = true;
        }
        chargingOverride = true;
        console.log("Wow" + $scope.isCharging);
        $scope.updateChart(true);
      }

      /*var momentInstance = moment;
       moment.defineLocale('en'
      momentInstance.updateLocale('en', {
          relativeTime : {
              future: "in %s",
              past:   "%s ago",
              s:  "s",
              m:  "a min",
              mm: "%d mins",
              h:  "an hr",
              hh: "%d hrs",
              d:  "a d",
              dd: "%d days",
              M:  "a mnth",
              MM: "%d mths",
              y:  "a yr",
              yy: "%d yrs"
          }
      });*/

      $scope.updateChart = function(force){
        if($scope.lastDataGraphed !== dataManager.startTime || !$scope.lastDataGraphed || force) {
          $scope.lastDataGraphed = dataManager.startTime;
          if(!chargingOverride){
            $scope.isCharging = dataManager.isCharging;
          }
          if($scope.isCharging) {
            $scope.series =  $localStorage.settings.data.chargingDataAttributes;
            $scope.datasetOverride = [{ yAxisID: 'y-axis-2' }, { yAxisID: 'y-axis-1' }]; //try to do this automagically
          } else {
            //$localStorage.settings.data.dataAttributes = ["actualSOC", "averageSpeed", "averageMotorWatts", "averageRegen", "averageClimateUsage"];
            $scope.series =  $localStorage.settings.data.drivingDataAttributes;
            $scope.datasetOverride = [{ yAxisID: 'y-axis-2' }, { yAxisID: 'y-axis-2' }, { yAxisID: 'y-axis-1' }];
          }

          var container = document.getElementById("large-chart-container");

          //var containerWidth = (batteryCircle.getBoundingClientRect().width);
          $scope.chart.width = container.getBoundingClientRect().width;
          $scope.chart.height = container.getBoundingClientRect().height;

          var chart = document.getElementById("time-chart").getContext("2d");
          //console.log("Chart width " + chart.canvas.width);
          //console.log("New width " + $scope.SOCChart.width);
          if(chart.canvas.width !== Math.round($scope.chart.width)) {
            chart.canvas.width = Math.round($scope.chart.width);
            chart.canvas.height = Math.round($scope.chart.height);
          }

          var newLabels = [];
          var newData  = [];
          async.each($scope.series, function(){
            newData.push([]);
          });

          //console.log("About to generate chart using " + Object.keys($localStorage.history).length + " enteries");


          var dataPointsToShow = [];

          var now = (new Date()).getTime();
          async.forEach($localStorage.history, function(historyDataPoint){
            if(historyDataPoint.startTime && parseInt(historyDataPoint.startTime) > parseInt(now) - $localStorage.settings.data.graphTimeEnd && historyDataPoint.isCharging == $scope.isCharging) { // &&
              if(!$scope.isCharging && historyDataPoint.transmission !== "P") {
                dataPointsToShow.push(historyDataPoint);
              } else if($scope.isCharging){
                dataPointsToShow.push(historyDataPoint);
              }
            }
          });
          //console.log(dataPointsToShow);
          var timeOffset = 1;
          var width = $("#time-chart").width() / 3.5; // 3.5 is arbritrary..
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

          async.forEach(dataPointsToShow, function(historyDataPoint, index){
            if(historyDataPoint.startTime > lastDataAdded.startTime + timeDifference){
              lastDataAdded = historyDataPoint;
              var dataPointsToAdd = [];
              async.each($scope.series, function(seriesTitle){
                if(historyDataPoint[seriesTitle] !== null) {
                  dataPointsToAdd.push(historyDataPoint[seriesTitle]);
                } else {
                  dataPointsToAdd.push(0);
                }
              });

              if(dataPointsToAdd.length == $scope.series.length) {
                async.forEachOf(dataPointsToAdd, function(dataPoint, index){
                  newData[index].push(dataPoint);
                });
                newLabels.push(moment(historyDataPoint.startTime).fromNow().replace(' ago', '').replace('a few ', '').replace('hour', 'hr').replace('minute', 'min').replace('second', 'sec'));
              }
            }
            //newLabels.push(moment(historyDataPoint));
          });

          $scope.labels = newLabels;
          $scope.data = newData;
          //console.log($scope.data);
          if(chartObject !== undefined) {
            //chartObject.redraw();
            chartObject.render();
          }
        }
      }

      $scope.chart = {
        width: "100%",
        height: "50vh"
      };

      $scope.$on('chart-create', function (evt, chart) {
        $scope.updateChart();
      });

      $rootScope.$on('historyUpdated', function(){
        $scope.updateChart();
      });

      $rootScope.$on('settingsUpdated', function(){
        $scope.updateChart();
      });

      $rootScope.$on('changeCharging', function(){
        $scope.isCharging = dataManager.isCharging;
        $scope.updateChart();
      });

      $scope.onClick = function (points, evt) {
        console.log(points, evt);
      };

      var formatKwValue = function(value){
        return Math.round(value / 1000) + "kWh";
      }

      var calculateOptions = function(){

        $scope.options = {
          elements: {
              point: {
                  radius: 2
              }
          },
          scaleOverride: true,
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              fontColor: self.showDarkTheme ? 'white' : 'black',
              fontSize: 10
            }
          },
          animation : false,
          animateScale: true,
          scales: {
            xAxes: [
              {
                ticks: {
                  fontColor: self.showDarkTheme ? 'white' : 'black',
                  autoSkip: true,
                  autoSkipPadding: 20,
                }
              }
            ],
            yAxes: [
              {
                id: 'y-axis-1',
                type: 'linear',
                display: true,
                position: 'left',
                ticks: {
                  fontColor: self.showDarkTheme ? 'white' : 'black',
                  callback:formatKwValue
                }
              },
              {
                id: 'y-axis-2',
                type: 'linear',
                display: true,
                position: 'right',
                ticks: {
                  fontColor: self.showDarkTheme ? 'white' : 'black',
                }
              }
            ]
          }
        }
        //calculateOptions();
      };
    }
  });
