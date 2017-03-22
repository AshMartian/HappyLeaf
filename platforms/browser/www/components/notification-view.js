happyLeaf.component('notificationView', {

    // Inline template which is binded to message variable
    // in the component controller
    templateUrl:'components/notification-view.html',

    // The controller that handles our component logic
    controller: function ($scope, $rootScope, dataManager, $localStorage, $mdDialog, deviceReady) {
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
            if(notification.title == data.title && now - notification.time < 25200000) {
              shouldAdd = false;
            }
          });
          if(shouldAdd){
            data.seen = false;
            $localStorage.notifications.unshift(data);
            $scope.unreadNotifications ++;
            $scope.recentNotification = data;
            $scope.$digest();
            if(cordova && $localStorage.settings.notifications.enablePush){
              cordova.plugins.notification.local.schedule({
                  id: $localStorage.notifications.length,
                  title: data.title,
                  icon: "file://img/logo.png",
                  data: data
              });
            }
          }
        }
      });

      deviceReady(function(){
        if(cordova){
          cordova.plugins.notification.local.on("trigger", function(notification) {
            var index = null;
            logManager.log("Opening notification: " + JSON.stringify(notification));
            for (var i = 0; i < $localStorage.notifications.length; i++) {
              if(JSON.stringify($localStorage.notifications[i]) == JSON.string(notification)) {
                openNotification(null, notification, i);
              }
            }
          });
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
         .title($translate.instant('NOTIFICATIONS.RESET_DIALOG.TITLE'))
         .textContent($translate.instant('NOTIFICATIONS.RESET_DIALOG.CONTENT'))
         .targetEvent(ev)
         .ok($translate.instant('NOTIFICATIONS.RESET_DIALOG.OKAY'))
         .cancel($translate.instant('NOTIFICATIONS.RESET_DIALOG.NEVERMIND'));

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
