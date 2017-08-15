import Ember from 'ember';

export function readableTemp(params/*, hash*/) {
  return (params[0] == 'C') ? 'HOME.TEMPC' : 'HOME.TEMPF';
}

export default Ember.Helper.helper(readableTemp);
