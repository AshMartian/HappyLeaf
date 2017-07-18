import Ember from 'ember';

export function style(params/*, hash*/) {
  var result = "";
  var arr = Array.isArray(params[0]) ? params[0] : params;

  for (var i = 0; i < arr.length; i+=2) {
    var css_attr = arr[i];
    var value = arr[i + 1];
    
    if(parseInt(value) && css_attr !== "opacity") {
        value = value + "px";
    }

    switch (css_attr) {
      case 'background-image':
        result += css_attr + ': url("' + value + '");';
        break;
      default: // [object Object]: undefined;
        result += css_attr + ': ' + value + ';';
        break;
    }

    if (i + 2 < arr.length) {
      result += " ";
    }
  }

  result = Ember.String.htmlSafe(result);

  return result;
}

export default Ember.Helper.helper(style);