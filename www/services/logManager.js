happyLeaf.factory('logManager', ['$rootScope', '$localStorage', function($rootScope, $localStorage){
  var currentVersion = "(fresh install)";
  if($localStorage.settings) {
    currentVersion = $localStorage.settings.about.version;
  }

  var self = {
    logText: "HappyLeaf Version " + currentVersion + "\r\n",
    logFull: "HappyLeaf Version " + currentVersion + "\r\n",

    historyLogName: moment().format("MM-DD-YYYY") + "-history.json",
    canLogName: moment().format("MM-DD-YYYY_HH-mm") + "-OBD-log.txt",

    betaDirectory: null,
    happyLeafDir: null,

    setupFilesystem: function(){
      var location = null;
      if($rootScope.platform == "Android") {
        location = cordova.file.externalRootDirectory;
      } else {
        location = cordova.file.syncedDataDirectory;
        return;
      }
      self.log("Root file directory: " + location);
      self.createLogDirectory(location, function(){
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
              fileWriter.seek(fileWriter.length);
              fileWriter.write(self.logFull);
              self.logFull = "";
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
      var now = "[ " + moment().format("MM-DD-YYYY hh:mm:ss a") + " ]  ";
      if($localStorage.settings.experimental.logOBDFile){
        if(typeof arguments == "array"){
          //console.log(arguments.join());
          async.eachSeries(arguments, function(logToAdd){
            self.logFull = self.logFull + "\r\n" + now + log;
          });
        } else {
          console.log(log);
          self.logFull = self.logFull + "\r\n" + now + log;
          //console.log(log);
        }
      }
      self.logText = now + log + "\r\n" + self.logText.substring(0, 30000);
    }
  };

  return self;
}]);
