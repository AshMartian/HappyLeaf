happyLeaf.component('connectionStatus', {

    // Inline template which is binded to message variable
    // in the component controller
    templateUrl:'components/connection-status-display.html',
    displayStyle: 'background-color: black;',

    bindings:{
      failedMessages: "="
    },

    controller: function($scope, connectionManager, bluetoothSend){
      this.connectedColor = "#76FF03";
      this.pendingColor = "#bebebe";
      this.waitingColor = "#eee574";
      this.offColor = "#FF9800";
      this.errorColor = "#ff3e3e";

      var self = this;

      if(!connectionManager.isConnected) {
        $scope.displayStyle = 'background-color: '+self.errorColor+';';
      }


      bluetoothSend.onWaiting(function(isWaiting){
        $scope.apply(function(){
          if(isWaiting) {
            $scope.displayStyle = 'background-color: '+self.waitingColor+';';
          } else {
            $scope.displayStyle = 'background-color: '+self.connectedColor+';';
          }
        });
      });
      //console.log("Watch got isWaiting " + bluetoothSend.isWaiting + "  " + self.waitingColor);

      $scope.$watch('$ctrl.failedMessages', function(){
        if(self.failedMessages) {
          $scope.displayStyle = 'background-color: '+self.offColor+';';
        } else if(connectionManager.isConnected) {
          $scope.displayStyle = 'background-color: '+self.connectedColor+';';
        }
      });

      $scope.$watch('connectionManager.isConnected', function(){
        //console.log("Is connected has changed");
        if(connectionManager.isConnected){
          $scope.displayStyle = 'background-color: '+self.connectedColor+';';
        } else {
          $scope.displayStyle = 'background-color: '+self.errorColor+';';
        }
      });
    }
});
