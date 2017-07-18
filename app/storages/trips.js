import StorageArray from 'ember-local-storage/local/array';

const Storage = StorageArray.extend();

// Uncomment if you would like to set initialState
// Storage.reopenClass({
//   initialState() {
//     return [];
//   }
// });
/*
    TRIP OBJECT
    {
        'type': upload ? file
        'timestamp': 101010293 (new Date()).getTime() of data origin
        'name': "Grocery trip" //user configurable?
        'data': [] //If type is upload
    }

*/
export default Storage;