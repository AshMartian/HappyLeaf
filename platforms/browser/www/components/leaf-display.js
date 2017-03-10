happyLeaf.component('leafDisplay', {

    // Inline template which is binded to message variable
    // in the component controller
    templateUrl:'components/leaf-display.html',

    // The controller that handles our component logic
    controller: function ($scope, $rootScope, dataManager, $filter) {
        this.headLights = dataManager.headLights;
        this.turnSignal = dataManager.turnSignal;
        this.turnAngle = dataManager.turnAngle;

        $scope.data = dataManager;

        $scope.needsResize = false;

        $scope.SOCChart = {
          data: [],
          colors: [],
          options: {cutoutPercentage: 78, animation : false, scaleOverride: true, tooltips: { enabled: false }, animateScale: true},
          width: 10,
          height: 10,
          left: 0,
          top: 10
        }

        $scope.AmpsChart = {
          data: [],
          colors: ["#ff993e", "#9B9B9B"],
          options: {cutoutPercentage: 60, scaleOverride: true, tooltips: { enabled: false }, rotation: 1 * Math.PI, circumference: 1 * Math.PI},
          width: 10,
          height: 10,
          left: 0,
          top: 10
        }

        $scope.ClimateChart = {
          data: [],
          colors: ["#ff993e", "#9B9B9B"],
          options: {cutoutPercentage: 60, scaleOverride: true, tooltips: { enabled: false }, rotation: 1 * Math.PI, circumference: 1 * Math.PI},
          width: 10,
          height: 10,
          left: 0,
          top: 10
        }
        //this.message = "Thomas component"
        this.element = $("#LEAF");
        $(this.element).width("100%");

        /*

        For testing Chart

        setInterval(function(){
          if(dataManager.actualSOC > 78) {
            dataManager.actualSOC = dataManager.actualSOC - 0.2;
            $scope.updateSOC();
          }

        }, 50);*/




        $scope.$on('chart-create', function (evt, chart) {
          console.log("Chart created");
          console.log(chart);
        });

        $(window).resize(function(){
          $scope.needsResize = true;
          $scope.updateDOM();
        });

        $rootScope.$on('dataUpdate', function(dataM) {
          $scope.updateDOM();
        });

        $rootScope.$on('dataUpdate:SOC', function(){
          $scope.updateSOC();
        });


        $scope.updateDOM = function(){
          //console.log("Updating DOM");
          if($scope.SOCChart.width == 10 || $scope.needsResize) {
            $scope.updateSOC();
          }
          if($scope.AmpsChart.width == 10 || $scope.needsResize){
            $scope.updateMotor();
          }
          if($scope.ClimateChart.width == 10 || $scope.needsResize){
            $scope.updateClimate();
          }

          if(dataManager.isCharging) {
            //$("#Charger_x5F_Flow lineargradient stop").attr('style', 'stop-color: #62C50F;');
            $('#Charging_x5F_Text').text((Math.round(dataManager.chargingVolts * 10) / 10) + "v");
          } else {
            //$("#Charger_x5F_Flow lineargradient stop").attr('style', 'stop-color: #A0A2A4;');
          }

          $("#Trans").text(dataManager.transmission);

          if(dataManager.tire1){
            $("#Tire_x5F_1").text(dataManager.tire1);
          }
          if(dataManager.tire2){
            $("#Tire_x5F_2").text(dataManager.tire2);
          }
          if(dataManager.tire3){
            $("#Tire_x5F_3").text(dataManager.tire3);
          }
          if(dataManager.tire4){
            $("#Tire_x5F_4").text(dataManager.tire4);
          }
          //console.log($scope.SOCChart.colors);
        };

        var graphedSOC = 0;
        $scope.updateSOC = function(){
          if(graphedSOC != dataManager.actualSOC){
            graphedSOC = dataManager.actualSOC;
            //$("#SOC").text($filter('number')(dataManager.actualSOC, 1) + "%");
            var batteryCircle = document.getElementById("Battery_x5F_Outline");

            var circleWidth = (batteryCircle.getBoundingClientRect().width);
            var offset = circleWidth / 30;
            $scope.SOCChart.width = circleWidth - (offset * 2);
            $scope.SOCChart.height = $scope.SOCChart.width;

            var chart = document.getElementById("SOC-circle").getContext("2d");
            //console.log("Chart width " + chart.canvas.width);
            //console.log("New width " + $scope.SOCChart.width);
            if(chart.canvas.width !== Math.round($scope.SOCChart.width)) {
              chart.canvas.width = Math.round($scope.SOCChart.width);
              chart.canvas.height = Math.round($scope.SOCChart.height);
              $scope.SOCChart.top = Math.round(batteryCircle.getBoundingClientRect().top + offset + window.scrollY);
              $scope.SOCChart.left = batteryCircle.getBoundingClientRect().left + offset;
            }
            //console.log("Width: " + $scope.SOCChart.width)


            var newChartData = [];
            var lastPercent = 0;
            if(dataManager.actualSOC >= 3) {
              for(var i = 1; i < 14; i++) {
                var fraction = (100/12)
                var currentHigh = (i ) * fraction;
                if(currentHigh <= dataManager.actualSOC) {
                  newChartData.push(1);
                } else if(currentHigh > dataManager.actualSOC && currentHigh < dataManager.actualSOC + fraction){
                  var cuttOffSOC = Math.floor(dataManager.actualSOC / fraction);
                  //console.log("Cutting off at: " + cuttOffSOC);
                  //console.log("Current High " + currentHigh);
                  var splitSOC = dataManager.actualSOC - (fraction * cuttOffSOC);
                  lastPercent = splitSOC / fraction;
                  //console.log("Last percent " + lastPercent);
                  if(lastPercent > 0 && lastPercent < 1){
                    newChartData.push(lastPercent);
                  } else {
                    newChartData.push(0.001);
                  }
                } else {
                    newChartData.push(13 - i + (1 - lastPercent) );
                  break;
                }
              }
              if($scope.SOCChart.data != newChartData){
                $scope.SOCChart.data = newChartData;
              }
            } else {
              $scope.SOCChart.data = [0,1];
            }

            //console.log("New data", $scope.SOCChart.data, $scope.SOCChart.data.length);

            $scope.SOCChart.colors = [];
            async.forEachOf($scope.SOCChart.data, function(chartData, index){
              if(chartData <= 1 && index < $scope.SOCChart.data.length - 1 || dataManager.actualSOC > 99.8) {
                $scope.SOCChart.colors.push("#62c50f");
              } else {
                $scope.SOCChart.colors.push("#ff0303");
              }
            });
          }
        };

        $rootScope.$on('dataUpdate:Climate', function(){
          $scope.updateClimate();
        });

        $rootScope.$on('dataUpdate:Motor', function(){
          $scope.updateMotor();
        });


        $scope.updateMotor = function(){
          var ExtraContainer = document.getElementById("Extra_x5F_1");
          if(!ExtraContainer) return;
          $scope.AmpsChart.width = ExtraContainer.getBoundingClientRect().width;
          $scope.AmpsChart.height = $scope.AmpsChart.width;
          if(dataManager.rawMotorVolts){
            $("#Motor_x5F_Speed").text(Math.round(dataManager.rawMotorVolts) + "v");
          }


          var chart = document.getElementById("Amps-Meter").getContext("2d");
          //console.log("Chart width " + chart.canvas.width);
          //console.log("New width " + $scope.SOCChart.width);
          if(chart.canvas.width !== Math.round($scope.AmpsChart.width)) {
            chart.canvas.width = Math.round($scope.AmpsChart.width);
            chart.canvas.height = Math.round($scope.AmpsChart.height);
            $scope.AmpsChart.top = Math.round(ExtraContainer.getBoundingClientRect().top + window.scrollY);
            $scope.AmpsChart.left = ExtraContainer.getBoundingClientRect().left;
          }
          //console.log("Width: " + $scope.SOCChart.width)

          if(dataManager.motorWatts && dataManager.motorWatts > 0 ) {

            var motorKW = dataManager.motorWatts / 1000;
            $scope.AmpsChart.data = [motorKW, 80 - motorKW];
            //console.log("Got motor watts " + $scope.AmpsChart.data);
          } else {
            $scope.AmpsChart.data = [0, 80];
          }
        }

        $scope.updateClimate = function(){
          //$("#Motor_x5F_Speed").text(dataManager.motorAmps);

          var ExtraContainer = document.getElementById("Extra_x5F_2");

          $scope.ClimateChart.width = ExtraContainer.getBoundingClientRect().width;
          $scope.ClimateChart.height = $scope.AmpsChart.width;

          var chart = document.getElementById("Climate-Meter").getContext("2d");
          //console.log("Chart width " + chart.canvas.width);
          //console.log("New width " + $scope.SOCChart.width);
          if(chart.canvas.width !== Math.round($scope.ClimateChart.width)) {
            chart.canvas.width = Math.round($scope.ClimateChart.width);
            chart.canvas.height = Math.round($scope.ClimateChart.height);
            $scope.ClimateChart.top = Math.round(ExtraContainer.getBoundingClientRect().top + window.scrollY);
            $scope.ClimateChart.left = ExtraContainer.getBoundingClientRect().left;
          }
          //console.log("Width: " + $scope.SOCChart.width)


          if(dataManager.climateConsumption > 0) {
            $scope.ClimateChart.data = [dataManager.climateConsumption / 1000, 6 - (dataManager.climateConsumption / 1000)];
            //$rootScope.$broadcast('log', "Changing climate " + JSON.stringify($scope.ClimateChart.data));
          } else {
            $scope.ClimateChart.data = [0, 1];
          }


        }
        //$scope.updateDOM();
    }
});
