happyLeaf.component('notificationView', {

    // Inline template which is binded to message variable
    // in the component controller
    templateUrl:'components/notification-view.html',

    // The controller that handles our component logic
    controller: function ($scope, $rootScope, dataManager, $localStorage, $mdDialog) {
      $scope.local = $localStorage;
      $scope.recentNotification = null;
      $scope.notificationIcon = "notifications";
      $scope.unreadNotifications = 0;
      var selectedNotification = null;
      var selectedNotificationIndex = null;

      var calculateUnread = function(){
        $scope.unreadNotifications = 0;
        async.forEach($localStorage.notifications, function(notification){
          if(!notification.seen) $scope.unreadNotifications ++;
        });
      }
      setTimeout(function(){
        calculateUnread();
        $scope.$digest();
      }, 1500);

      /*
        Notification template
          {
            title: "New Notification",
            time: (new Date()).getTime(),
            seen: false,
            content: "<html here>",
            icon: "material icon"
          }
      */
      if(!$localStorage.notifications) $localStorage.notifications = [];

      $rootScope.$on('notification', function(e, data){
        console.log("adding notification ", data);
        if(data){
          var shouldAdd = true;
          var now = (new Date()).getTime();
          $scope.unreadNotifications = 0;
          async.forEach($localStorage.notifications, function(notification){
            if(!notification.seen) $scope.unreadNotifications ++;
            console.log(now - notification.time);
            if(notification.title == data.title && now - notification.time < 300000) {
              shouldAdd = false;
            }
          });
          if(shouldAdd){
            data.seen = false;
            $localStorage.notifications.unshift(data);
            $scope.unreadNotifications ++;
            $scope.recentNotification = data;
            $scope.$digest();
          }
        }
      });


      $scope.openNotification = function(ev, notification, notificationIndex) {
        notification.seen = true;
        selectedNotification = {};
        selectedNotification.title = notification.title;
        selectedNotification.content = notification.content;
        selectedNotification.time = notification.time;
        selectedNotification.icon = notification.icon;
        selectedNotification.seen = notification.seen;
        selectedNotificationIndex = notificationIndex;
        if(!$scope.dialogOpen) {
          $scope.dialogOpen = true;
          $mdDialog.show({
            controller: DialogController,
            templateUrl: 'components/notification-dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true
          }).then(function(answer) {
            $scope.dialogOpen = false;
          }, function() {
            $scope.dialogOpen = false;
          });
        } else {
          $mdDialog.cancel();
          $scope.dialogOpen = false;
        }
        calculateUnread();
      };

      $scope.clearAll = function(ev){
        var confirm = $mdDialog.confirm()
         .title('Reset all notifications?')
         .textContent('This will perminantly delete all current notifications, are you sure?')
         .targetEvent(ev)
         .ok('Yes, reset!')
         .cancel('Nevermind');

         $mdDialog.show(confirm).then(function() {
           $localStorage.notifications = [];
           calculateUnread();
         }, function() {

         });
      };


      function DialogController($scope, $mdDialog, $sce) {
        $scope.notification = selectedNotification;
        if($scope.notification.content && typeof $scope.notification.content === 'string') $scope.notification.content = $sce.trustAsHtml($scope.notification.content);

        $scope.delete = function(){
          $mdDialog.hide();
          $localStorage.notifications.splice(selectedNotificationIndex, 1);
        };

        $scope.hide = function() {
          $mdDialog.hide();
          $scope.dialogOpen = false;
        };

        $scope.cancel = function() {
          $mdDialog.cancel();
          $scope.dialogOpen = false;
        };
      }
    }
  });
