import StorageObject from 'ember-local-storage/local/object';

const Storage = StorageObject.extend();

// Uncomment if you would like to set initialState
 Storage.reopenClass({
   initialState() {
     return {
       milesDrivenToday: 0,
       milesDriven: 0,
       currentTripStart: {}
     };
   }
 });

export default Storage;
