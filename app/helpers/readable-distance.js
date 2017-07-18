import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";

export function readableDistance(params/*, hash*/) {
  return (params[0] == 'M') ? 'HOME.MILES' : 'HOME.KILOMETERS';
}

export default Ember.Helper.helper(readableDistance);
