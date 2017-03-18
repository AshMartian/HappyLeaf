happyLeaf.component('largeTimeChart', {

    // Inline template which is binded to message variable
    // in the component controller
    templateUrl:'components/large-time-chart-widget.html',
    displayStyle: 'background-color: black;',

    controller: function($scope, $rootScope, storageManager, $localStorage, dataManager){
      $scope.local = $localStorage;
      $scope.lastDataGraphed = null;

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
        $localStorage.settings.data.chargingDataAttributes = ["actualSOC", "chargingWatts", "averageClimateUsage"];
      }

      $scope.labels = [];
      if(!$localStorage.settings.data.colors){
        $localStorage.settings.data.colors = ["#62c50f", "#3785e8", "#d45e55"];
      }

      $(window).resize(function(){
        $scope.needsResize = true;
        $scope.updateChart();
      });



      $scope.toggleCharging = function(){
        if($scope.isCharging){
          $scope.isCharging = false;
        } else {
          $scope.isCharging = true;
        }

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

          console.log("About to generate chart using " + Object.keys($localStorage.history).length + " enteries");


          var dataPointsToShow = [];

          var now = (new Date()).getTime();
          async.forEach($localStorage.history, function(historyDataPoint){
            if(historyDataPoint.startTime && parseInt(historyDataPoint.startTime) > parseInt(now) - $localStorage.settings.data.graphTimeEnd && historyDataPoint.isCharging == $scope.isCharging) { // &&
              dataPointsToShow.push(historyDataPoint);
            }
          });
          //console.log(dataPointsToShow);
          var timeOffset = 1;
          if(dataPointsToShow.length > 150) {
            timeOffset = 1 + (dataPointsToShow.length / 150);
          }
          var timeDifference = timeOffset * 29999;

          /* OVerly complex, doesn't seem to make good graphs
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

      $scope.data = [
        [65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90, 28, 48, 40, 19, 86, 27, 90],
        [5, 6, 4, 5, 3, 2, 1, 5, 6, 4, 5, 3, 2, 1]
      ];
      $scope.onClick = function (points, evt) {
        console.log(points, evt);
      };

      $scope.options = {
        scaleOverride: true,
        legend: {
          display: true,
          position: 'bottom'
        },
        animation : false,
        animateScale: true,
        scales: {
          yAxes: [
            {
              id: 'y-axis-1',
              type: 'linear',
              display: true,
              position: 'left'
            },
            {
              id: 'y-axis-2',
              type: 'linear',
              display: true,
              position: 'right'
            }
          ]
        }
      };
    }
  });
