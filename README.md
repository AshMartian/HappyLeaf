# Happy Leaf

0.5
_______


## Introduction

Happy LEAF aims to be the missing interface from the original Nissan LEAF. First gen EV drivers were given a very restrictied view of the future of transportation. Ease range anxiety by knowing exactly how much energy you have left, with a more intiutive and customizable overview of your vehicle.

Happy Leaf requires an OBD device to communicate with your Leaf. [They are readily available online](https://www.amazon.com/Veepeak-Scanner-Adapter-Diagnostic-Trouble/dp/B00WPW6BAE/ref=sr_1_1?s=automotive&ie=UTF8&qid=1491881368&sr=1-1&keywords=veepeak+obd2+scanner).

## Core Dependencies

- [Ember Paper](http://miguelcobain.github.io/ember-paper)
- [Ember Cordova](http://embercordova.com/)

## Setup

Install node js.

```
git clone https://github.com/blandman/HappyLeaf
cd HappyLeaf
npm install
bower install
```

## Run Happy LEAF in the browser

`ember serve`

## Run Happy LEAF on a device

`ember cdv:serve`

Visit http://locahost:4200

## Contributing

- Make a pull request :)
- Currently tests folder needs to be deleted (after `ember generate`)
- Working tests would be nice.. maybe automated in the future.

## Translations

[See the translation.js files](https://github.com/blandman/HappyLeaf/blob/master/app/locales/en/translations.js). Copy this file, and translate into your locale. 
The language also needs to be added to the languages array in app/components/ui/settings-dialog.js
```
languages: [{
    name: "SETTINGS.DISPLAY.LANGUAGE.ENGLISH",
    short: "en"
  },{
    name: "SETTINGS.DISPLAY.LANGUAGE.FRENCH",
    short: "fr"
  },... ect
```
