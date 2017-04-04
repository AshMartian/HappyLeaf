happyLeaf.component('settingsDialog', {

    // Inline template which is binded to message variable
    // in the component controller
    templateUrl:'components/settings-dialog.html',

    // The controller that handles our component logic
    controller: function ($scope, $rootScope, dataManager, $filter, $localStorage, storageManager, $mdDialog) {
      $scope.settingsIcon = "settings";
      $scope.dialogOpen = false;

      $scope.local = $localStorage;

      $scope.toggleDialog = function(ev) {
        if(!$scope.dialogOpen){
          $scope.settingsIcon = "close";
          $scope.dialogOpen = true;
          $mdDialog.show({
            controller: DialogController,
            templateUrl: 'components/tab-dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true
          }).then(function(answer) {
                $scope.dialogOpen = false;
                $scope.settingsIcon = "settings";
              }, function() {
                $scope.dialogOpen = false;
                $scope.settingsIcon = "settings";
              });
        } else {
          $mdDialog.cancel();
          $scope.dialogOpen = false;
          $scope.settingsIcon = "settings";
        }

      };

      function DialogController($scope, $mdDialog, $translate, $localStorage, dataManager, logManager) {
        $scope.local = $localStorage;
        $scope.loveIcon = "favorite";
        $scope.availableIcons = ["favorite", "hourglass_full", "favorite", "gavel", "http", "favorite", "query_builder", "weekend", "favorite", "lightbulb_outline", "important_devices", "favorite", "bug_report", "android", "battery_charging_60", "favorite", "battery_charging_20", "github-circle", "apple", "favorite_border"];
        $scope.languages = [{
          name: "SETTINGS.DISPLAY.LANGUAGE.ENGLISH",
          short: "en"
        },{
          name: "SETTINGS.DISPLAY.LANGUAGE.FRENCH",
          short: "fr"
        },{
          name: "SETTINGS.DISPLAY.LANGUAGE.RUSSIAN",
          short: "ru"
        },{
          name: "SETTINGS.DISPLAY.LANGUAGE.PORTUGUESE",
          short: "pt"
        },{
          name: "SETTINGS.DISPLAY.LANGUAGE.SPANISH",
          short: "es"
        }];
        $scope.tireLowThreshold = $localStorage.settings.notifications.tireLowThreshold;
        $scope.tireHighThreshold = $localStorage.settings.notifications.tireHighThreshold;
        $scope.$watch('tireLowThreshold', function(){
          if($scope.tireLowThreshold >= $scope.tireHighThreshold) {
            $scope.tireHighThreshold = $scope.tireLowThreshold + 2;
          }

          $localStorage.settings.notifications.tireHighThreshold = $scope.tireHighThreshold;
          $localStorage.settings.notifications.tireLowThreshold = $scope.tireLowThreshold;
        });
        $scope.$watch('tireHighThreshold', function(){
          if($scope.tireHighThreshold <= $scope.tireLowThreshold) {
            $scope.tireLowThreshold = $scope.tireHighThreshold - 2;
          }
          $localStorage.settings.notifications.tireHighThreshold = $scope.tireHighThreshold;
          $localStorage.settings.notifications.tireLowThreshold = $scope.tireLowThreshold;
        })

        $scope.setLanguage = function(shortCode) {
          $localStorage.lang = shortCode;
          $translate.use(shortCode);
        };

        setInterval(function(){
          var randomIconInt = Math.floor(Math.random() * $scope.availableIcons.length)
          $scope.loveIcon = $scope.availableIcons[randomIconInt];
          $scope.$digest();
        }, 2000);

        $scope.clearHistory = function(ev){
          var confirm = $mdDialog.confirm()
           .title($translate.instant("SETTINGS.DELETE_CONFIRM.TITLE"))
           .textContent($translate.instant("SETTINGS.DELETE_CONFIRM.CONTENT"))
           .targetEvent(ev)
           .ok($translate.instant("SETTINGS.DELETE_CONFIRM.CONFIRM"))
           .cancel($translate.instant("SETTINGS.DELETE_CONFIRM.NEVERMIND"));

           $mdDialog.show(confirm).then(function() {
             logManager.historyLogName = moment().format("MM-DD-YYYY") + "-after-reset-history.json";
             $localStorage.history = {};
             dataManager.reset();
           }, function() {
           });
        }

        var cleanUpKeys = function(array){
          return array.map(function (c, index) {
            var cParts = c.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); });
                                              // uppercase the first character
              var data = {
                name: cParts,
                key: c
              };
              return data;
          });
        }

        $scope.allDataKeys = cleanUpKeys(Object.keys(dataManager)).filter(function(key) {
            return typeof dataManager[key.key] == 'number' && !key.key.match(/time/i);
        });
        $scope.dataKeys = cleanUpKeys($localStorage.settings.data.drivingDataAttributes)

        $scope.filterSelected = true;

        var createFilterFor= function(query) {
          var lowercaseQuery = angular.lowercase(query);
          return function filterFn(key) {
            return (key.key.indexOf(lowercaseQuery) != -1);
          };
        }
        $scope.querySearch = function(criteria) {
          console.log($scope.allDataKeys);
          console.log($scope.allDataKeys.filter(createFilterFor(criteria)));
          return criteria ? $scope.allDataKeys.filter(createFilterFor(criteria)) : [];
        }



        $scope.hide = function() {
          $mdDialog.hide();
          $scope.dialogOpen = false;
          $scope.settingsIcon = "settings";
        };

        $scope.cancel = function() {
          $mdDialog.cancel();
          $scope.dialogOpen = false;
          $scope.settingsIcon = "settings";
        };

        $scope.answer = function(answer) {
          $mdDialog.hide(answer);
          $scope.dialogOpen = false;
          $scope.settingsIcon = "settings";
        };
      }
    }
  });
