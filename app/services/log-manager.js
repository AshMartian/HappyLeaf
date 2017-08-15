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
    if(this.get('settings.settings')){
      currentVersion = this.get('settings.settings.about.version');
    }
  },

  resetHistoryName() {
    this.set('historyLogName', moment().format("MM-DD-YYYY_HH-mm") + "-history.json");
  },

  setupFilesystem: function(callback){
    this.set('location', null);
    if(!cordova) return;
    if(cordova.platformId === "android") {
      this.set('location', cordova.file.externalRootDirectory);
    } else {
      this.set('location', cordova.file.syncedDataDirectory);
    }
    console.log("Root file " + cordova.platformId + " directory: " + this.get('location'));
    this.createLogDirectory(this.get('location'), () => {
      //this.saveLog();
      //this.saveHistory();
      if(typeof callback == "function") callback();
    });
  },

  createLogDirectory: function(rootDirEntry, callback) {
    window.resolveLocalFileSystemURL(rootDirEntry, (fs)=> {
      console.log("Got fs: " + JSON.stringify(fs));
      fs.getDirectory('Happy_Leaf', { create: true }, (dirEntry) => {
        this.set('happyLeafDir', dirEntry);
          dirEntry.getDirectory('BETA', { create: true }, (subDirEntry) => {
            this.set('betaDirectory', subDirEntry);
            console.log("Got beta directory", subDirEntry);
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

  saveLog() {
    //console.log("Saving log", this.get('settings.settings.experimental'));
    if(this.get('settings.settings') && this.get('settings.settings.experimental.logOBDFile') && this.get('betaDirectory')){
      //console.log("Made it inside the if statement")
      this.get('betaDirectory').getFile(this.get('canLogName'), { create: true }, ( fileEntry ) => {
        console.log("Got fileEntry", fileEntry);
        fileEntry.createWriter( ( fileWriter ) => {
            fileWriter.onwriteend = ( result ) => {
              this.log('OBD log file write done.');
              console.log("OBD file write done");
              this.set('fullLog', "");
            };
            fileWriter.onerror = function( error ) {
              this.log( JSON.stringify(error) );
            };
            fileWriter.seek(fileWriter.length);
            fileWriter.write(this.fullLog);
            
        }, ( error )=> { this.log( JSON.stringify(error) ); } );
      }, ( error )=> { this.log( JSON.stringify(error) ); } );
    }
  },

  saveHistory() {
    //console.log("About to save history log ", this.get('settings.settings.experimental.logHistoryFile'), this.get('betaDirectory'));
    if(this.get('settings.settings.experimental.logHistoryFile')){
      this.get('betaDirectory').getFile(this.get('historyLogName'), { create: true }, ( fileEntry ) => {
        fileEntry.createWriter(( fileWriter ) => {
            fileWriter.onwriteend = ( result ) => {
              this.log('History file write done.');
              console.log("History file write done");
            };
            fileWriter.onerror = ( error ) => {
              this.log( JSON.stringify(error) );
            };
            fileWriter.write( JSON.stringify(this.get('dataManager').getTrip()) );
        }, ( error ) => { this.log( JSON.stringify(error) ); } );
      }, ( error ) => { this.log( JSON.stringify(error) ); } );
    }
  },

  getPastLogs(success) {
    console.log("Looking for past logs");
     window.resolveLocalFileSystemURL(this.get('location'),  (fs) => {
      //this.log("Got fs: " + JSON.stringify(fs));
      var directoryReader = this.get('betaDirectory').createReader();
      directoryReader.readEntries((entries) => {
        success(entries.filter(function(file) {
          return file.name.match(/json/i);
        }).reverse());
      }, (error) => {
        console.log("Ran into error reading past logs", error);
      });
     });
  },

  getLog(logName, done) {
    window.resolveLocalFileSystemURL(this.get('location'), (fs)=> {
      fs.getFile(logName, {}, (fileEntry) => {
        fileEntry.file(function(dictFile) {
          let reader = new FileReader();

          reader.onloadend = function (e) {
            done(JSON.parse(this.result));
          };

          reader.readAsText(dictFile);
        });
      });
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
        ///console.log(log);
        this.set('fullLog', this.fullLog + "\r\n" + now + log);
        
      }
    }
    console.log(log);
    this.set('logText', now + log + "\r\n" + this.logText.substring(0, 30000));
  }
});
