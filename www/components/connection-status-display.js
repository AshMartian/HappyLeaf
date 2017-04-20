happyLeaf.component('connectionStatus', {

    // Inline template which is binded to message variable
    // in the component controller
    templateUrl:'components/connection-status-display.html',
    displayStyle: 'background-color: black;',

    bindings:{
      failedMessages: "="
    },

    controller: function($scope, $interval, $translate, connectionManager){
      this.connectedColor = "#76FF03";
      this.pendingColor = "#bebebe";
      this.waitingColor = "#eee574";
      this.offColor = "#FF9800";
      this.errorColor = "#ff3e3e";
      //$scope.connction = connectionManager;
      $scope.progress = 0;

      /*$interval(function(){
        $scope.$digest();
      }, 1500);*/

      var self = this;

      if(!connectionManager.isConnected) {
        $scope.displayStyle = 'background-color: '+self.errorColor+';';
      } else {
        $scope.displayStyle = 'background-color: '+self.pendingColor+';';
      }

      //console.log("Watch got isWaiting " + bluetoothSend.isWaiting + "  " + self.waitingColor);

      $scope.$on('failedMessage', function(){
        if(connectionManager.failedMessages) {
          $scope.displayStyle = 'background-color: '+self.offColor+';';
        } else if(connectionManager.isConnected) {
          $scope.displayStyle = 'background-color: '+self.connectedColor+';';
        }
      });

      $scope.$on('connected', function(){
        //console.log("Is connected has changed");
        if(connectionManager.isConnected){
          cordova.plugins.backgroundMode.configure({
            text: $translate.instant("HOME.CONNECTED")
          });
          $scope.displayStyle = 'background-color: '+self.connectedColor+';';
        } else {
          cordova.plugins.backgroundMode.configure({
            text: $translate.instant("HOME.DISCONNECTED")
          });
          $scope.displayStyle = 'background-color: '+self.errorColor+';';
        }
      });
    }
});
