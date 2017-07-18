import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";

var SOCChartObject = null, AmpsChartObject = null, ClimateChartObject = null;

export default Ember.Component.extend({
  dataManager: Ember.inject.service('data-manager'),
  resizeService: Ember.inject.service('Resize'),
  elementId: "LEAF",
  widget: {},

  resizeWidthSensitive: true,
  needsResize: false,

  SOCChart: {
    colors: [],
    options: { cutoutPercentage: 78, animation : false, scaleOverride: false, tooltips: { enabled: false }, animateScale: true},
    width: 10,
    height: 10,
    left: 0,
    top: 10
  },

  AmpsChart: {
    data: [],
    colors: ["#ff993e", "#9B9B9B"],
    width: 10,
    height: 10,
    left: 0,
    top: 10
  },

  ClimateChart: {
    data: [],
    colors: ["#ff993e", "#9B9B9B"],
    width: 10,
    height: 10,
    left: 0,
    top: 10
  },

  didInsertElement() {
    //console.log("Inserting LEAF");
    window.scrollTo(0, 0);

    if(this.get('item')){
      this.get('item').$().on('resizestop', (e, item) => {
          //handle resize
          Ember.run.later(() => {
            this.resizeElements();
          }, 500);
      });
    }

    $("#LEAFOUTTER").load('img/HappyLeaf.svg', () => {
      Ember.run.later(() => {
        var SOCctx = document.getElementById("SOC-circle").getContext('2d');
        var Ampsctx = document.getElementById("Amps-pie").getContext('2d');
        var Climatectx = document.getElementById("Climate-pie").getContext('2d');

        SOCChartObject =  new Chart(SOCctx, {
            type: 'doughnut',
            data: {
              datasets: [{data: [1, 1]}],
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
              ],
              borderColor: [
                '#fff'
              ],
              borderWidth: 1
            },
            options: { cutoutPercentage: 78, animation : false, scaleOverride: false, tooltips: { enabled: false }, animateScale: true},
        });

        AmpsChartObject =  new Chart(Ampsctx, {
            type: 'pie',
            data: {
              datasets: [{data: [1, 1]}],
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
              ],
              borderColor: [
                '#fff'
              ],
              borderWidth: 1
            },
            options: {cutoutPercentage: 60, animation: false, scaleOverride: false, tooltips: { enabled: false }, rotation: 1 * Math.PI, circumference: 1 * Math.PI}
        });

        ClimateChartObject =  new Chart(Climatectx, {
            type: 'pie',
            data: {
              datasets: [{data: [1, 1]}],
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
              ],
              borderColor: [
                '#fff'
              ],
              borderWidth: 1
            },
            options: {cutoutPercentage: 60, animation: false, scaleOverride: false, tooltips: { enabled: false }, rotation: 1 * Math.PI, circumference: 1 * Math.PI}
        });

        this.resizeElements();
      });
    });
    
    /*$.get('/img/HappyLeaf.svg', function(data) {
      console.log(data);
      $("#LEAFOUTTER").html(data);
      console.log($("#LEAFOUTTER"));
    });*/
    this.get('resizeService').on('didResize', event => {
      Ember.run.later(() => {
        this.resizeElements(event);
      }, 90);
    });
    this.updateData();
  },

  updateData: function(){
    //console.log("Going to update Leaf Display using jQuery");

    if(this.get('dataManager').isCharging) {
      //$("#Charger_x5F_Flow lineargradient stop").attr('style', 'stop-color: #62C50F;');
      $('#Charging_x5F_Text').text((Math.round(this.get('dataManager').chargingWatts * 10) / 10) + "Wh");
    } else {
      //$("#Charger_x5F_Flow lineargradient stop").attr('style', 'stop-color: #A0A2A4;');
    }

    $("#Trans").text(this.get('dataManager').transmission);
    $("#ACCV").text((Math.round(this.get('dataManager').accVolts * 100) / 100));
    $("#SOC_x5F_Text").text(t("LEAF_DISPLAY.SOC"));
    $("#motor-watts").text(Math.round(this.get('dataManager').motorWatts / 100) / 10);
    $("#climate-consumption").text(Math.round(this.get('dataManager').climateConsumption / 100) / 10);

    if(this.get('dataManager').tire1){
      $("#Tire_x5F_1").text(this.get('dataManager').tire1);
    }
    if(this.get('dataManager').tire2){
      $("#Tire_x5F_2").text(this.get('dataManager').tire2);
    }
    if(this.get('dataManager').tire3){
      $("#Tire_x5F_3").text(this.get('dataManager').tire3);
    }
    if(this.get('dataManager').tire4){
      $("#Tire_x5F_4").text(this.get('dataManager').tire4);
    }

    if(this.get('dataManager').hasDataFor('tires')) {
      $('#Tires').attr('fill-opacity', 1);
    } else {
      $('#Tires').attr('fill-opacity', 0.5);
    }

    if(this.get('dataManager').hasDataFor('transmission')) {
      $('#Trans').attr('fill-opacity', 1);
    } else {
      $('#Trans').attr('fill-opacity', 0.5);
    }

    if(this.get('dataManager').hasDataFor('accVolts')) {
      $('#_x31_2v').attr('fill-opacity', 1);
    } else {
      $('#_x31_2v').attr('fill-opacity', 0.6);
    }

    if(this.get('dataManager').hasDataFor('actualSOC')) {
        $('.soc-container').fadeTo(1);
      } else {
        $('.soc-container').fadeTo(0.7);
      }

    if(Math.round(this.get('dataManager').motorWatts / 1000) > 0) {
      $("#LEAFOUTTER").removeClass('regening'); //because jquery is faster........
      setTimeout(function(){
        $("#LEAFOUTTER").addClass('motor-usage');
      }, 80);
    } else if(Math.round(this.get('dataManager').motorWatts / 1000) < 0 && parseInt(this.get('dataManager').speed) > 0) {
      $("#LEAFOUTTER").removeClass('motor-usage');
      setTimeout(function(){
        $("#LEAFOUTTER").addClass('regening');
      }, 80);
    } else {
      $("#LEAFOUTTER").removeClass('motor-usage');
      $("#LEAFOUTTER").removeClass('regening');
    }

    $("#LEAFOUTTER").toggleClass('charging', this.get('dataManager').isCharging)
        .toggleClass('headlights', this.get('dataManager').headLights)
        .toggleClass('foglights', this.get('dataManager').fogLights)
        .toggleClass('parked', this.get('dataManager').parkingBrakeOn)
        .toggleClass('buckled', this.get('dataManager').isBuckled)
        .toggleClass('fast', (this.get('dataManager').chargingVolts > 260 || this.get('dataManager').motorWatts > 60000))
        .toggleClass('medium', (this.get('dataManager').chargingVolts > 140 || this.get('dataManager').motorWatts > 30000))
        .toggleClass('slow', (this.get('dataManager').chargingVolts <= 140 || (this.get('dataManager').motorWatts > 0 && this.get('dataManager').motorWatts <= 30000)))
        .toggleClass('blinker-right', this.get('dataManager').turnSignal == 'right')
        .toggleClass('blinker-left', this.get('dataManager').turnSignal == 'left')
        .toggleClass('climate-usage', this.get('dataManager').climateConsumption > 0)
        .toggleClass('acc-usage', this.get('dataManager').accVolts > 13.75); //because angular bindings are slow..

    if(SOCChartObject){
      Ember.run.later(() => {
        var newChartData = [{data:[]}];
        var lastPercent = 0;
        if(this.get('dataManager').actualSOC >= 1) {
          for(var i = 1; i < 14; i++) {
            var fraction = (100/12)
            var currentHigh = (i ) * fraction;
            if(currentHigh <= this.get('dataManager').actualSOC) {
              newChartData[0].data.push(1);
            } else if(currentHigh > this.get('dataManager').actualSOC && currentHigh < this.get('dataManager').actualSOC + fraction){
              var cuttOffSOC = Math.floor(this.get('dataManager').actualSOC / fraction);
              //console.log("Cutting off at: " + cuttOffSOC);
              //console.log("Current High " + currentHigh);
              var splitSOC = this.get('dataManager').actualSOC - (fraction * cuttOffSOC);
              lastPercent = splitSOC / fraction;
              //console.log("Last percent " + lastPercent);
              if(lastPercent > 0 && lastPercent < 1){
                newChartData[0].data.push(lastPercent);
              } else {
                newChartData[0].data.push(0.001); //because chart logic
              }
            } else {
                newChartData[0].data.push(13 - i + (1 - lastPercent) );
              break;
            }
          }
          if(SOCChartObject.data.datasets != newChartData){
            //console.log("Updating chart datasets", newChartData);
            SOCChartObject.data.datasets = newChartData;
          }
        } else {
          SOCChartObject.data.datasets = [{data: [0,1]}];
        }
        //SOCChartObject.data.labels = newChartData;

        

        //console.log("New data", this.get(.SOCChart.data, this.get(.SOCChart.data.length);

        let newColors = [];
        newChartData[0].data.forEach((chartData, index) => {
          if(chartData <= 1 && index < newChartData[0].data.length - 1 || this.get('dataManager').actualSOC > 99.8) {
            newColors.push("#62c50f");
          } else {
            newColors.push("#c54646");
          }
        });
        SOCChartObject.data.datasets[0].backgroundColor = newColors;
        //this.set('SOCChart.chartObject.data', Ember.copy(this.get('SOCChart.data')));
        //console.log(SOCChartObject);
        SOCChartObject.update();
        //this.get('SOCChart.chartObject').render();
        //console.log("Chart updated");
      });
    }

    var ACCCont = $("#ACC_x5F_Cont");

    $("#ACC_x5F_charge").attr('height', (parseInt(ACCCont.attr("height")) / 1.3) * Math.max(0.2, (this.get('dataManager').accVolts - 9) / 5));
    $("#ACC_x5F_charge").attr('y', parseInt(ACCCont.attr("y")) + (parseInt(ACCCont.attr("height")) - parseInt($("#ACC_x5F_charge").attr('height'))) - 1);

    if(this.get('dataManager').rawMotorVolts){
      $("#Motor_x5F_Speed").text(Math.round(this.get('dataManager').rawMotorVolts / 20) + "v");
    } else {
      $("#Motor_x5F_Speed").text("0v");
    }

    if(AmpsChartObject){
      if(this.get('dataManager').motorWatts && this.get('dataManager').motorWatts !== 0) {
        if(this.get('dataManager').motorWatts > 0){
          let motorKW = this.get('dataManager').motorWatts / 1000;
          if(motorKW > 90) {
            motorKW = 90;
          }
          AmpsChartObject.data.datasets = [{
            data: [motorKW, 90 - motorKW],
            backgroundColor: ["#ff993e", "#9B9B9B"]
          }];
        } else if(this.get('dataManager').motorWatts < 0){
          let motorKW = this.get('dataManager').motorWatts / 1000;
          if(motorKW < -40) {
            motorKW = -40;
          }
          AmpsChartObject.data.datasets = [{
            data: [40 - Math.abs(motorKW), Math.abs(motorKW)],
            backgroundColor: ["#9B9B9B", "#62C50F"]
          }];
        } else {
          let regenKw = this.get('dataManager').targetRegenBraking;
          AmpsChartObject.data.datasets = [{
            data: [40 - regenKw, regenKw],
            backgroundColor: ["#9B9B9B", "#62C50F"]
          }];
        }
        //console.log("Got motor watts " + $scope.AmpsChart.data);
      } else {
        AmpsChartObject.data.datasets = [{
          data: [0, 90],
          backgroundColor: ["#ff993e", "#9B9B9B"]
        }];
      }
      AmpsChartObject.update();
    }

    if(ClimateChartObject) {
      var climateColors = ["#ff993e", "#9B9B9B"];
      if(this.get('dataManager.alternateClimateUsage')) {
        ClimateChartObject.data.datasets = [{
          data: [this.get('dataManager.alternateClimateUsage') / 1000, 6 - (this.get('dataManager.alternateClimateUsage') / 1000)],
          backgroundColor: climateColors
        }];
      } else if(this.get('dataManager.climateConsumption') > 0) {
        ClimateChartObject.data.datasets = [{
          data: [this.get('dataManager.climateConsumption') / 1000, 6 - (this.get('dataManager.climateConsumption') / 1000)],
          backgroundColor: climateColors
        }];
        //$rootScope.$broadcast('log', "Changing climate " + JSON.stringify($scope.ClimateChart.data));
      } else {
        ClimateChartObject.data.datasets = [{
          data: [0, 1],
          backgroundColor: climateColors
        }];
      }

      ClimateChartObject.update();
    }

  }.observes('dataManager.properties'),

  resizeElements(event) {
    var batteryCircle = document.getElementById("Battery_x5F_Outline");
    var leaf = document.getElementById("LEAF");
    //var batteryBounding = $("#Battery_x5F_Outline")[0].getBBox();
    var circleWidth = (batteryCircle.getBoundingClientRect().width);
    var offset = circleWidth / 100;
    this.set('SOCChart.width', circleWidth - offset);
    this.set('SOCChart.height', this.get('SOCChart.width'));

    var chart = document.getElementById("SOC-circle").getContext("2d");
    //console.log("Chart width " + chart.canvas.width);
    //console.log("New width " + this.get(.SOCChart.width);
    if(chart.canvas.width !== Math.round(this.get('SOCChart.width'))) {
      chart.canvas.width = Math.round(this.get('SOCChart.width'));
      chart.canvas.height = Math.round(this.get('SOCChart.height'));
      this.set('SOCChart.top', Math.round(batteryCircle.getBoundingClientRect().top - window.scrollY - $("#LEAFOUTTER").offset().top) - offset);
      this.set('SOCChart.left', (batteryCircle.getBoundingClientRect().left - leaf.getBoundingClientRect().left)+ offset);
    }

    var ExtraContainer = document.getElementById("Extra_x5F_2");

    this.set('ClimateChart.width', ExtraContainer.getBoundingClientRect().width);
    this.set('ClimateChart.height', this.get('ClimateChart').width);

    chart = document.getElementById("Climate-pie").getContext("2d");
    //console.log("Chart width " + chart.canvas.width);
    //console.log("New width " + $scope.SOCChart.width);
    if(chart.canvas.width !== Math.round(this.get('ClimateChart').width)) {
      chart.canvas.width = Math.round(this.get('ClimateChart').width);
      chart.canvas.height = Math.round(this.get('ClimateChart').height);
      this.set('ClimateChart.top', Math.round(ExtraContainer.getBoundingClientRect().top - window.scrollY - $("#LEAFOUTTER").offset().top));
      this.set('ClimateChart.left',  ExtraContainer.getBoundingClientRect().left);
    }

    ExtraContainer = document.getElementById("Extra_x5F_1");
    if(!ExtraContainer) return;
    this.set('AmpsChart.width', ExtraContainer.getBoundingClientRect().width);
    this.set('AmpsChart.height', this.get('AmpsChart.width'));
    


    chart = document.getElementById("Amps-pie").getContext("2d");
    //console.log("Chart width " + chart.canvas.width);
    //console.log("New width " + $scope.SOCChart.width);
    if(chart.canvas.width !== Math.round(this.get('AmpsChart.width'))) {
      chart.canvas.width = Math.round(this.get('AmpsChart.width'));
      chart.canvas.height = Math.round(this.get('AmpsChart.height'));
      this.set('AmpsChart.top', Math.round(ExtraContainer.getBoundingClientRect().top - window.scrollY - $("#LEAFOUTTER").offset().top));
      this.set('AmpsChart.left', ExtraContainer.getBoundingClientRect().left);
    }
  }
});
