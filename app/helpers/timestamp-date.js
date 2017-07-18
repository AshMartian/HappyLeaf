import Ember from 'ember';

export function timestampDate(params/*, hash*/) {
  return new Date(params[0]);
}

export default Ember.Helper.helper(timestampDate);
