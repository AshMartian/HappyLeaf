import Ember from 'ember';
import { storageFor } from 'ember-local-storage';

var currentVersion = "(fresh install)";
export default Ember.Service.extend({
  settings: storageFor('settings'),
  dataManager: Ember.inject.service('data-manager'),
  
  logText: "HappyLeaf Version " + currentVersion + "\r\n",
  logFull: "HappyLeaf Version " + currentVersion + "\r\n",

  historyLogName: null,
  canLogName: null,

  betaDirectory: null,
  happyLeafDir: null,

  init() {
    this._super();
    this.set('historyLogName', moment().format("MM-DD-YYYY_HH-mm") + "-history.json");
    this.set('canLogName', moment().format("MM-DD-YYYY_HH-mm") + "-OBD-log.txt");
    if(this.get('settings').settings){
      currentVersion = this.get('settings').settings.about.version;
    }
  },

  resetHistoryName() {
    this.set('historyLogName', moment().format("MM-DD-YYYY_HH-mm") + "-history.json");
  },

  setupFilesystem: function(){
    this.set('location', null);
    if(cordova.platformId === "android") {
      this.set('location', cordova.file.externalRootDirectory);
    } else {
      this.set('location', cordova.file.syncedDataDirectory);
    }
    console.log("Root file " + cordova.platformId + " directory: " + this.get('location'));
    this.createLogDirectory(this.get('location'), () => {
      this.saveLog();
      this.saveHistory();
    });
  },

  createLogDirectory: function(rootDirEntry, callback) {
    window.resolveLocalFileSystemURL(rootDirEntry, (fs)=> {
      console.log("Got fs: " + JSON.stringify(fs));
      fs.getDirectory('Happy_Leaf', { create: true }, (dirEntry) => {
        this.set('happyLeafDir', dirEntry);
          dirEntry.getDirectory('BETA', { create: true }, (subDirEntry) => {
            this.set('betaDirectory', subDirEntry);
            //createFile(subDirEntry, moment().format("MM-DD-YYYY-HH-mm") + "-OBD-log.txt");
            //createFile(subDirEntry, moment().format("MM-DD-YYYY-HH-mm") + "-history.json");
            callback();
          }, this.onErrorGetDir);
      }, this.onErrorGetDir);
    });
  },

  onErrorGetDir: function(error){
    this.log("ERROR: unable to create files/directory on sdcard :( \n\r" + JSON.stringify(error))
  },

  saveLog: function() {
    if(this.get('settings').settings && this.get('settings').settings.experimental.logOBDFile){
      this.betaDirectory.getFile(this.canLogName, { create: true }, ( fileEntry ) => {
        fileEntry.createWriter( ( fileWriter ) => {
            fileWriter.onwriteend = ( result ) => {
              this.log('OBD log file write done.');
            };
            fileWriter.onerror = function( error ) {
              this.log( JSON.stringify(error) );
            };
            fileWriter.seek(fileWriter.length);
            fileWriter.write(this.logFull);
            this.logFull = "";
        }, ( error )=> { this.log( JSON.stringify(error) ); } );
      }, ( error )=> { this.log( JSON.stringify(error) ); } );
    }
  },

  saveHistory: function() {
    console.log("About to save history log");
    if(this.get('settings').settings && this.get('settings').settings.experimental.logHistoryFile){
      this.betaDirectory.getFile(this.historyLogName, { create: true }, ( fileEntry ) => {
        fileEntry.createWriter(( fileWriter ) => {
            fileWriter.onwriteend = ( result ) => {
              this.log('History file write done.');
            };
            fileWriter.onerror = ( error ) => {
              this.log( JSON.stringify(error) );
            };
            fileWriter.write( JSON.stringify(this.get('dataManager').getTrip()) );
        }, ( error ) => { this.log( JSON.stringify(error) ); } );
      }, ( error ) => { this.log( JSON.stringify(error) ); } );
    }
  },

  getPastLogs() {
    console.log("Looking for past logs");
     window.resolveLocalFileSystemURL(this.get('location'),  (fs) => {
      this.log("Got fs: " + JSON.stringify(fs));

     });
  },

  log: function(log) {
    var now = "[ " + moment().format("MM-DD-YYYY hh:mm:ss a") + " ]  ";
    if(this.get('settings').settings && this.get('settings').settings.experimental.logOBDFile){
      if(typeof arguments === 'object'){
        //console.log(arguments.join());
        arguments.forEach((logToAdd) => {
          this.set('fullLog', this.fullLog + "\r\n" + now + log);
        });
      } else {
        ////console.log(log);
        this.set('fullLog', this.fullLog + "\r\n" + now + log);
        console.log(log);
      }
    }
    this.set('logText', now + log + "\r\n" + this.logText.substring(0, 30000));
  }
});
