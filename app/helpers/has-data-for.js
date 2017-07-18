import Ember from 'ember';

export function hasDataFor(params/*, hash*/) {
  
  if(typeof params[0] == "object") {
    var dataManager = params[0];
    if(dataManager.hasDataFor) {
      var hasData = dataManager.hasDataFor(params[1]);
      console.log(`Have data for ${params[1]} and it is ${hasData}`);
      return hasData;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

export default Ember.Helper.helper(hasDataFor);
