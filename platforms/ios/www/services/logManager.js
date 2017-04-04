happyLeaf.factory('logManager', ['$rootScope', '$localStorage', function($rootScope, $localStorage){
  var currentVersion = "(fresh install)";
  if($localStorage.settings) {
    currentVersion = $localStorage.settings.about.version;
  }

  setTimeout(function(){
    //don't run out of memory
    self.logFull = "HappyLeaf Version " + currentVersion + "\r\n";
    self.canLogName = moment().format("MM-DD-YYYY_HH-mm") + "-OBD-log.txt";
  }, 2000000);

  var self = {
    logText: "HappyLeaf Version " + currentVersion + "\r\n",
    logFull: "HappyLeaf Version " + currentVersion + "\r\n",
    
    historyLogName: moment().format("MM-DD-YYYY") + "-history.json",
    canLogName: moment().format("MM-DD-YYYY_HH-mm") + "-OBD-log.txt",

    betaDirectory: null,
    happyLeafDir: null,

    setupFilesystem: function(){
      self.log("Root file directory: " + cordova.file.externalRootDirectory);
      self.createLogDirectory(cordova.file.externalRootDirectory, function(){
        self.saveLog();
        self.saveHistory();
      });
    },

    createLogDirectory: function(rootDirEntry, callback) {
      window.resolveLocalFileSystemURL(rootDirEntry, function (fs) {
        self.log("Got fs: " + JSON.stringify(fs));
        fs.getDirectory('Happy_Leaf', { create: true }, function (dirEntry) {
          self.happyLeafDir = dirEntry;
            dirEntry.getDirectory('BETA', { create: true }, function (subDirEntry) {
              self.betaDirectory = subDirEntry;
              //createFile(subDirEntry, moment().format("MM-DD-YYYY-HH-mm") + "-OBD-log.txt");
              //createFile(subDirEntry, moment().format("MM-DD-YYYY-HH-mm") + "-history.json");
              callback();
            }, self.onErrorGetDir);
        }, self.onErrorGetDir);
      });
    },

    onErrorGetDir: function(error){
      self.log("ERROR: unable to create files/directory on sdcard :( \n\r" + JSON.stringify(error))
    },

    saveLog: function() {
      if($localStorage.settings.experimental.logOBDFile){
        self.betaDirectory.getFile(self.canLogName, { create: true }, function( fileEntry ) {
          fileEntry.createWriter( function( fileWriter ) {
              fileWriter.onwriteend = function( result ) {
                self.log('OBD log file write done.');
              };
              fileWriter.onerror = function( error ) {
                self.log( JSON.stringify(error) );
              };
              fileWriter.write(self.logFull);
          }, function( error ) { self.log( JSON.stringify(error) ); } );
        }, function( error ) { self.log( JSON.stringify(error) ); } );
      }
    },

    saveHistory: function() {
      if($localStorage.settings.experimental.logHistoryFile){
        self.betaDirectory.getFile(self.historyLogName, { create: true }, function( fileEntry ) {
          fileEntry.createWriter( function( fileWriter ) {
              fileWriter.onwriteend = function( result ) {
                self.log('History file write done.');
              };
              fileWriter.onerror = function( error ) {
                self.log( JSON.stringify(error) );
              };
              fileWriter.write( JSON.stringify($localStorage.history) );
          }, function( error ) { self.log( JSON.stringify(error) ); } );
        }, function( error ) { self.log( JSON.stringify(error) ); } );
      }
    },

    log: function(log) {
      if($localStorage.settings.experimental.logOBDFile){
        var now = "[ " + moment().format("MM-DD-YYYY hh:mm:ss a") + " ]  ";
        if(typeof arguments == "array"){
          //console.log(arguments.join());
          async.eachSeries(arguments, function(logToAdd){
            self.logFull = now + logToAdd + "\r\n" + self.logFull;
          });
        } else {
          console.log(log);
          self.logFull = now + log + "\r\n" + self.logFull;
          //console.log(log);
        }
        self.logText = self.logFull.substring(0, 30000);
      }
    }
  };

  $rootScope.$on('log', function(data){
    self.log(data.log);
  });

  return self;
}]);
