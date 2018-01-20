import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";
import { storageFor } from 'ember-local-storage';


export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  storageManager: Ember.inject.service('storage-manager'),
  settings: storageFor('settings'),
  widgets: storageFor('widgets'),


  loveIcon: 'love',

  languages: [{
    name: "SETTINGS.DISPLAY.LANGUAGE.ENGLISH",
    short: "en"
  },{
    name: "SETTINGS.DISPLAY.LANGUAGE.FRENCH",
    short: "fr"
  },{
    name: "SETTINGS.DISPLAY.LANGUAGE.RUSSIAN",
    short: "ru"
  },{
    name: "SETTINGS.DISPLAY.LANGUAGE.PORTUGUESE",
    short: "pt"
  },{
    name: "SETTINGS.DISPLAY.LANGUAGE.SPANISH",
    short: "es"
  }],

  didInsertElement() {
    console.log("Setting lang ", this.get('settings.settings.language'))
    this.set('i18n.locale', this.get('settings.settings.language'));
  },

  actions: {
    closeDialog() {
      this.set('showDialog', false);
    },

    resetSettings() {
      this.get('settings').reset();
    },

    resetWidgets() {
      this.get('widgets').reset();
    },

    resetDatabase: function resetDatabase() {
      this.get('storageManager').resetDatabase();
    },

    changeLang(lang) {
      console.log("Setting lang", lang);
      this.set('i18n.locale', lang.short);
      this.get('settings').set('settings.language', lang.short);
    },

    changeTemp(unit) {
      this.get('settings').set('settings.experience.tempUnits', unit);
    },

    changeDistance(unit) {
      console.log("Setting units", unit);
      this.get('settings').set('settings.experience.distanceUnits', unit);
    },

    toggleSetting(setting) {
      //console.log('setting', setting);
      this.get('settings').set(setting, this.get(`settings.${setting}`) ? false : true);
    },

    changeValue(setting, v) {
      //console.log("setting ", setting, v)
      this.get('settings').set(setting, v);
      if(setting == 'settings.notifications.tireHighThreshold') {
        if(this.get('settings.settings.notifications.tireHighThreshold') < this.get('settings.settings.notifications.tireLowThreshold') + 1) {
          this.get('settings').set('settings.notifications.tireLowThreshold', v - 1);
        }
      } else if(setting == 'settings.notifications.tireLowThreshold') {
        if(this.get('settings.settings.notifications.tireLowThreshold') > this.get('settings.settings.notifications.tireHighThreshold') - 1) {
          this.get('settings').set('settings.notifications.tireHighThreshold', v + 1);
        }
      }
    }
  }
});
