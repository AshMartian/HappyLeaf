import Ember from 'ember';
import { storageFor } from 'ember-local-storage';

export default Ember.Component.extend({
    trips: storageFor('trips'),
    dataManager: Ember.inject.service('data-manager'),
    didPickTrip: null,
    
    actions: {
        browseForTrips() {
            console.log("Will browse for trips");
        },
        loadTrip(tripData) {
            this.get('dataManager').loadTrip(tripData);
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
