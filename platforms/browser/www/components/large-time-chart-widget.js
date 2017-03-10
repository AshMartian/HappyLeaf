happyLeaf.component('largeTimeChart', {

    // Inline template which is binded to message variable
    // in the component controller
    templateUrl:'components/large-time-chart-widget.html',
    displayStyle: 'background-color: black;',

    controller: function($scope, $rootScope, storageManager, $localStorage, dataManager){
      $scope.series = ["motorWatts", "actualSOC", "climateConsumption"];
      $scope.labels = [];

      $scope.updateChart = function(){
        if(dataManager.isCharging) {
          $scope.series = ["actualSOC", "chargingWatts"];
        } else {
          $scope.series = ["actualSOC", "averageMotorWatts", "averageRegen", "averageClimateUsage"];
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
        var timeDifference = 0;
        var now = (new Date()).getTime();

        if($localStorage.historyCount > 100) {
          var relaventHistory = 0;
          var historyKeys = Object.keys($localStorage.history);
          for(var i = 0; i < $localStorage.historyCount; i++){
            if(historyKeys[i] >= now - $localStorage.settings.data.graphTimeEnd){
              relaventHistory = i;
              break;
            }
          }

          timeDifference = parseInt(historyKeys[$localStorage.historyCount - 1]) - parseInt(historyKeys[relaventHistory]);
        }


        console.log("Time difference " + timeDifference / 100);
        var lastDataAdded = {startTime: 0};

        async.forEach($localStorage.history, function(historyDataPoint){
          if(historyDataPoint.startTime && parseInt(historyDataPoint.startTime) > (parseInt(now) - $localStorage.settings.data.graphTimeEnd)) { //(historyDataPoint.startTime > lastDataAdded.startTime + (timeDifference / 100) &&
            lastDataAdded = historyDataPoint;
            var dataPointsToAdd = [];
            async.each($scope.series, function(seriesTitle){
              if(historyDataPoint[seriesTitle] !== null) {
                dataPointsToAdd.push(historyDataPoint[seriesTitle]);
              }
            });

            if(dataPointsToAdd.length == $scope.series.length) {
              async.forEachOf(dataPointsToAdd, function(dataPoint, index){
                newData[index].push(dataPoint);
              });
              newLabels.push(moment(historyDataPoint.startTime).fromNow().replace(' ago', ''));
            }
          }
          //newLabels.push(moment(historyDataPoint));
        });

        $scope.labels = newLabels;
        $scope.data = newData;
        console.log($scope.data);
      }

      $scope.chart = {
        width: "55vw",
        height: "300px"
      };

      $scope.$on('chart-create', function (evt, chart) {
        $scope.updateChart();
      });

      $rootScope.$on('historyUpdated', function(){
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
      $scope.datasetOverride = [{ yAxisID: 'y-axis-2' }, { yAxisID: 'y-axis-1' }];
      $scope.options = {
        scaleOverride: true,
        legend: {
          display: true
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
