happyLeaf.factory('storageManager', ['$rootScope', 'dataManager', 'connectionManager', 'logManager', '$localStorage', function($rootScope, dataManager, connectionManager, logManager, $localStorage){

  var self = {
    db: null,

    createHistoryPoint: function(){
      if(connectionManager.isConnected){
        var now = (new Date()).getTime();
        dataManager.endTime = now;
        var currentDataManager = {};
        async.forEach(Object.keys(dataManager), function(key){
          if(typeof dataManager[key] !== 'function'){
            currentDataManager[key] = dataManager[key];
          }
        });

        $localStorage.history[now] = currentDataManager;
        $localStorage.historyCount = Object.keys($localStorage.history).length;
        dataManager.historyCreated();
        $rootScope.$broadcast('historyUpdated');
        $rootScope.$broadcast('log', {log: "Created history, now have " + $localStorage.historyCount});
      }
      //console.log("Creating history point");
    },

    startupDB: function(){
      console.log("WOW Wtf..");
      /*
      //failed attempt at web SQL..
      $rootScope.$on('dataUpdate', function(event, data){
        console.log("Going to save this data " + data.keys().join());
        //check here if an interval should be saved.
      });

      self.db = window.sqlitePlugin.openDatabase({name: 'happyLeaf.db', location: 'default'});

      self.db.transaction(function(tx) {
       tx.executeSql('CREATE TABLE IF NOT EXISTS Trips (time_start, time_end, id, start_KW, end_KW, start_odo, end_obo)');
       console.log("Try to loop over keys avaliable in dataManager");
       console.log(dataManager.keys().join());
       tx.executeSql('CREATE TABLE IF NOT EXISTS TripIntervals (time_start, time_end, id)');
       //tx.executeSql('INSERT INTO DemoTable VALUES (?,?)', ['Alice', 101]);
       //tx.executeSql('INSERT INTO DemoTable VALUES (?,?)', ['Betty', 202]);
     }, function(error) {
       console.log('Transaction ERROR: ' + error.message);
     }, function() {
       console.log('Populated database OK');
     });*/

   }
  };

  console.log("Cleaning up history older than 24 hours");
  if($localStorage.history) {
    var ONE_DAY = 172800000;
    var now = (new Date()).getTime();
    $localStorage.milesDrivenToday = 0;
    var lastDrivenToday = 0;
    async.forEach(Object.keys($localStorage.history), function(key){
      var historyDataPoint = $localStorage.history[key];
      if(moment().isSame(moment(historyDataPoint.startTime), 'day') && historyDataPoint.odometer > lastDrivenToday && historyDataPoint.odometer < 400000) {
        if(lastDrivenToday == 0) {
          $localStorage.milesDrivenToday += 1;
        } else {
          $localStorage.milesDrivenToday += historyDataPoint.odometer - lastDrivenToday;
        }

        lastDrivenToday = historyDataPoint.odometer;
      }

      //Goodbye
      if(parseInt(now) - ONE_DAY > parseInt(key)) {
        delete $localStorage.history[key];
      }
    });
  } else {
    $localStorage.history = {};
  }

  return self;
}]);
