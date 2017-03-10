happyLeaf.factory('storageManager', ['$rootScope', 'dataManager', '$localStorage', function($rootScope, dataManager, $localStorage){

  var self = {
    db: null,

    createHistoryPoint: function(){
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
      console.log("Creating history point with this data");
      console.log($localStorage.history);
      console.log(self);
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
  var ONE_DAY = 60 * 60 * 1000 * 24;
  var now = (new Date()).getTime();
  async.forEach(Object.keys($localStorage.history), function(key){
    if((parseInt(now) - parseInt(key)) > ONE_DAY) {
      delete $localStorage.history[key];
    }
  });

  return self;
}]);
