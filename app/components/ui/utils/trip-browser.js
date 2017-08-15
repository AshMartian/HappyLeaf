import Ember from 'ember';
import { storageFor } from 'ember-local-storage';
import subscribe from 'ember-cordova-events/utils/subscribe';

export default Ember.Component.extend({
    trips: storageFor('trips'),
    dataManager: Ember.inject.service('data-manager'),
    logManager: Ember.inject.service('log-manager'),
    didPickTrip: null,

    didInsertElement() {
        this._super();
        if(window.cordova) {
            this.getPastLogs();
        }
    },

    isReady: subscribe('cordova.deviceready', function() {
        this.getPastLogs();
    }),

    getPastLogs() {
        var logDate = moment().format("MM-DD-YYYY");
        this.get('logManager').setupFilesystem(() => {
            console.log("Device is ready in trip browser");
            this.get('logManager').getPastLogs((logs) => {
                //console.log("Got previous logs", logs[0]);
                var fileTrips = [];
                var foundTrip = false;
                logs.forEach((log) => {
                    fileTrips.push({
                        'type': 'file',
                        'name': log.name,
                        'file': log.fullPath
                    });
                    if(log.name.match(logDate) && !foundTrip) {
                        foundTrip = true;
                        console.log("Found trip from today");
                        this.get('logManager').set('historyLogName', log.name);
                        this.get('logManager').getLog(log.fullPath, (data) => {
                            this.get('dataManager').loadTrip(data, false);
                        });
                    }
                });
                var oldTrips = this.get('trips.content');
                Array.prototype.push.apply(oldTrips,fileTrips);
                //console.log(oldTrips);
                this.set('trips', oldTrips);
            }); 
        });
    },
    
    actions: {
        browseForTrips() {
            console.log("Will browse for trips");
        },
        loadTrip(trip) {
            if(trip.data){
                this.get('dataManager').loadTrip(trip.data, true);
            } else {
                this.get('logManager').getLog(trip.file, (data) => {
                    this.get('dataManager').loadTrip(data, true);
                });
            }
            
            if(this.get('didPickTrip')) this.get('didPickTrip')();
        },
        fileLoaded: function(file) {
            // readAs="readAsFile" 
            //console.log(file.name, file.type, file.size);
            var parsedData = JSON.parse(file.data);
            console.log(parsedData);
            // readAs="readAsArrayBuffer|readAsBinaryString|readAsDataURL|readAsText" 
            //console.log(file.name, file.type, parsedData, file.size);
            var newTrip = {
                type: "upload",
                name: file.name,
                data: parsedData
            }
            this.get('trips').addObject(newTrip);
            // There is also file.filename for backward compatibility 
        }
    }
});
