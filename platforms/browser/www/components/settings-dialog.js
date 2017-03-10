happyLeaf.component('settingsDialog', {

    // Inline template which is binded to message variable
    // in the component controller
    templateUrl:'components/settings-dialog.html',

    // The controller that handles our component logic
    controller: function ($scope, $rootScope, dataManager, $filter, $localStorage, $mdDialog) {
      $scope.settingsIcon = "settings";

      $localStorage.settings = {
        data: {
          graphTimeEnd: 1000 * 60 * 60 * 12,
          showLatestGraph: false,

        }
      };

      $scope.openDialog = function(ev) {
        $mdDialog.show({
          controller: DialogController,
          templateUrl: 'components/tab-dialog.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:true
        }).then(function(answer) {
              $scope.status = 'You said the information was "' + answer + '".';
            }, function() {
              $scope.status = 'You cancelled the dialog.';
            });
      };

      function DialogController($scope, $mdDialog) {
        $scope.hide = function() {
          $mdDialog.hide();
        };

        $scope.cancel = function() {
          $mdDialog.cancel();
        };

        $scope.answer = function(answer) {
          $mdDialog.hide(answer);
        };
      }
    }
  });
