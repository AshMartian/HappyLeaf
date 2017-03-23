var translationsEN = {
  WELCOME: {
    TITLE: 'Welcome',
    LOADING_TEXT: 'Loading...',
    SCANNING: "Scanning...",
    CONNECTING: 'Connecting...',
    CONNECTED: 'Connected!',
    TESTING: 'Testing...',
    SUCCESS: 'Connected to {{output}}!',
    FOUND: 'Found {{length}} paired devices',
    DEVICE_TIPS: "If you do not see your ODB, pair a device in Settings -> Bluetooth of your OS.<br/>Ensure no other applications are using your Bluetooth device.",
    BLUETOOTH_ERROR: {
      TITLE: "ODB Bluetooth Needed",
      CONTENT: "Bluetooth must be enabled to communicate with OBD device.",
      RETRY: "Try Again"
    },
    OFFLINE_WARNING: {
      TITLE: "Offline Mode",
      CONTENT: "Currently not connected to a OBD device. Will load last known history data. If last connected bluetooth device is in range, will attempt to reconnect automatically.",
      CONTINUE: "Continue"
    }
  },
  HOME: {
    TITLE: "Happy Leaf",
    USED: "Used",
    REMAINING: "Remaining",
    GAINED: "Gained",
    HAPPY: "Happy",
    TODAY: "Today",
    TO: "to",
    YES: "Yes",
    NO: "No",
    HEALTH: "Health",
    SINCE: "since",
    WATTS_MIN: "Watts per min",
    MENUS: {
      TO_DARK: "Switch to Dark",
      TO_LIGHT: "Switch to Light",
      USE_WATTS: "Use Watts/{{units}}",
      USE_KW: "Use {{units}}/kW",
      RESET: "Reset",
      EXPLAIN: "Explain"
    },
    RESET_WARNING: {
      TITLE: 'Reset Watt Meter?',
      CONTENT: 'This will reset the current Watt measurement and set the Watt start time to now. Are you sure?',
      CONTINUE: 'Yes, reset!',
      NEVERMIND: 'Nevermind'
    },
    EXPLAIN_METER: {
      TITLE: 'Watt Meter',
      CONTENT: 'Watts are the measurement of energy transfer, being able to track Watt usage is key to increase efficiency. This widget measures the Watt change from a specified time, and can be reset anytime.',
      OKAY: 'Got it!'
    }
  },
  LEAF_DISPLAY: {
    SOC: "State of Charge",
    MOTOR: "Motor",
    CLIMATE: "Climate"
  },
  NOTIFICATIONS: {
    CLEAR_ALL: "Clear All",
    NONE_YET: "No notifications yet!",
    RESET_DIALOG: {
      TITLE: 'Reset all notifications?',
      CONTENT: 'This will perminantly delete all current notifications, are you sure?',
      OKAY: 'Yes, reset!',
      NEVERMIND: 'Nevermind'
    },
    HIGH_BAT_TEMP: {
      TITLE: "High Battery Temperature",
      CONTENT: "<h1>High Battery temperature</h1><p>High battery temperatures can cause irriversable damage, avoid quick charging until the battery has cooled.<br/>Your battery temperature was read at: {{temp}}&deg. </p>"
    },
    LOW_BAT_TEMP: {
      TITLE: "Low Battery Temperature",
      CONTENT: "<h1>Low Battery temperature</h1><p>Low battery temperatures can cause irriversable damage. Connect to a charger to activate battery heater. <br/>Your battery temperature was read at: {{temp}}&deg. </p>"
    },
    RAPID_TEMP: {
      TITLE: "Rapid Battery Temperature Increase",
      CONTENT: "<h1>Battery temperature rapidly increased</h1><p>The battery temperature has increased by over 1&deg; very rapidly.<br/>Your battery temperature was read at: {{temp}}&deg with an increase of {{increase}}&deg;. </p>"
    },
    LOW_12V: {
      TITLE: "12v Battery Low",
      CONTENT: "<h1>Check your battery!</h1><p>It appears your 12v battery is low. <br/>Your battery was read at: {{volts}} volts. </p>"
    },
    LOW_TRACTION: {
      TITLE: "Battery Low",
      CONTENT: "<h1>Low battery charge!</h1><p>You're running out of energy! Get to a charger fast! <br/>Your battery was read at: {{SOC}}%. </p>"
    },
    LOW_HX: {
      TITLE: "Low HX",
      CONTENT: "<h1>Battery HX is low</h1><p>HX is corrilated to health, and it's looking low.<br/>Your battery HX was read at: {{hx}}%. </p>"
    },
    LOW_OUTSIDE_TEMP: {
      TITLE: "Watch For Ice",
      CONTENT: "<h1>Low temp outside</h1><p>It is below freezing outside, watch for Ice. Outside temp was read at: {{temp}}&deg. </p>"
    },
    HIGH_OUTPUT: {
      TITLE: "High Battery Output",
      CONTENT: "<h1>High Battery Output</h1><p>It may be fun to rapidly accelerate but this could be harmful to your battery.<br/>Avoid rapid acceleration to ensure maximum battery longevity. Your motor output was read at {{watts}}Wh</p>"
    },
    TIRES: {
      R_FRONT: "Front Right",
      L_FRONT: "Front Left",
      R_REAR: "Rear Right",
      L_REAR: "Rear Left"
    },
    HIGH_TIRE: {
      TITLE: "{{tire}} Tire Pressure High",
      CONTENT: "<h1>High {{tire}} Tire pressure</h1><p>High tire pressures may cause poor efficiency.<br/>{{tire}} tire was read at: {{value}} psi. </p>",
    },
    LOW_TIRE: {
      TITLE: "{{tire}} Tire Pressure Low",
      CONTENT: "<h1>Low {{tire}} Tire pressure</h1><p>Low tire pressures may cause poor efficiency<br/>{{tire}} tire was read at: {{value}} psi. </p>"
    }
  },
  SETTINGS: {
    TABS: {
      SETTINGS: "Settings",
      DATA: "Data",
      ABOUT: "About"
    },
    TITLE: "Manage",
    NOTIFICATIONS: {
      TITLE: "Notifications",
      ENABLE_DEVICE: "Send notifications to OS"
    },
    DISPLAY: {
      TITLE: "Display",
      EXTRA_DATA: "Hide extra data",
      EXTRA_DATA_DETAIL: "Will improve performance",
      LANGUAGE: {
        ENGLISH: "English",
        FRENCH: "French",
        TITLE: "Language"
      }
    },
    DARK_MODE: {
      TITLE: "Theme/Dark Mode",
      AMBIENT: "Ambient Light sensor",
      AMBIENT_SENSITIVITY: "Ambient Light Sensitivity",
      DARK_HEADLIGHTS: "Activate Dark with Headlights"
    },
    EXPERIMENTAL: {
      TITLE: "Experimental",
      SAVE_OBD: "Save OBD log file",
      SAVE_HISTORY: "Save History log file",
      DEBUG_CODES: "Send debug codes",
      DEBUG_EXPLAIN: "(very slow)"
    },
    DATA: {
      CLEAR: "Clear History",
      DELETE: "Delete"
    }
  }
};

var translationsFR = {
  WELCOME: {
    TITLE: 'Bienvenue',
    LOADING_TEXT: 'Chargement...',
    SCANNING: "Recherche...",
    CONNECTING: 'Connexion...',
    CONNECTED: 'Connecté!',
    TESTING: 'Test...',
    SUCCESS: 'Connecté à {{output}}!',
    FOUND: '{{length}} dispositif trouvé',
    DEVICE_TIPS: "Si vous ne voyez pas votre ODB, couplez un périphérique dans Paramètres -> Bluetooth de votre OS. <br/> Assurez-vous qu'aucune autre application n'utilise votre périphérique Bluetooth.",
    BLUETOOTH_ERROR: {
      TITLE: "Dispositif ODB Bluetooth demandé",
      CONTENT: "Vous devez activer la fonction Bluetooth afin de communiquer avec votre dispositif OBD.",
      RETRY: "Essayez encore"
    },
    OFFLINE_WARNING: {
      TITLE: "Mode hors-ligne",
      CONTENT: "Vous n'êtes pas connecté a un dispositif OBD. Chargement des données en historique du dernier parcours. Si le dernier dispositif bluetooth est a proximité une tentative de reconnexion sera effectué automatiquement.",
      CONTINUE: "Continue"
    }
  },
  HOME: {
    TITLE: "Happy Leaf Heureuse",
    USED: "Utilisé",
    REMAINING: "Restant",
    GAINED: "Gagné",
    HAPPY: "Happy",
    TODAY: "Aujourd'hui",
    TO: "à",
    YES: "Oui",
    NO: "Non",
    HEALTH: "Santé",
    SINCE: "depuis",
    WATTS_MIN: "Watts par min",
    MENUS: {
      TO_DARK: "Affichage sombre",
      TO_LIGHT: "Affichage Lumineux",
      USE_WATTS: "Watts/{{units}} utilisé",
      USE_KW: "{{units}}/kW utilisé",
      RESET: "Reset",
      EXPLAIN: "Explication"
    },
    RESET_WARNING: {
      TITLE: 'Réinitialiser Wattmètre?',
      CONTENT: "Vous allez réinitialiser les données du Wattmètre à 0 et l'heure de début maintenant. Êtes-vous certain?",
      CONTINUE: 'Oui, réinitialiser!',
      NEVERMIND: 'Non'
    },
    EXPLAIN_METER: {
      TITLE: 'Wattmètre',
      CONTENT: "Les Watts est la mesure de l'énergie utilisé, plus vous économisez des Watts, plus vous augmenterez votre efficacité, plus vous réduirez l'énergie nécessaire pour vous déplacer. Ce Widget mesure le nombre de Watt depuis votre dernière réinitialisation.",
      OKAY: 'Daccord!'
    }
  },
  LEAF_DISPLAY: {
    SOC: "État de la recharge",
    MOTOR: "Moteur",
    CLIMATE: "Température extérieure"
  },
  NOTIFICATIONS: {
    CLEAR_ALL: "Effacer tout",
    NONE_YET: "Aucune notification pour le moment!",
    RESET_DIALOG: {
      TITLE: 'Réinitialiser toutes les notifications?',
      CONTENT: 'Vous effacerez en permanence toutes les notifications, êtes-vous certain?',
      OKAY: 'Oui, effacez!',
      NEVERMIND: 'Non merci!'
    },
    HIGH_BAT_TEMP: {
      TITLE: "Température de la batterie ÉLEVÉ",
      CONTENT: "<h1>Température de la batterie ÉLEVÉ</h1><p>Une température élevé de la batterie peu causer des dommages irréversibles, évitez d'effectuer une recharge rapide jusqu'à ce que la température de votre batterie aura diminué.<br/>La température de votre batterie : {{temp}}&deg. </p>"
    },
    LOW_BAT_TEMP: {
      TITLE: "Température de la batterie basse",
      CONTENT: "<h1>Température de batterie faible</h1><p>La température de votre batterie est très faible et peu causer des dommages irréversibles, branchez votre Leaf a une borne de recharge afin d'activer le chauffe batterie. <br/>La température de votre batterie : {{temp}}&deg. </p>"
    },
    RAPID_TEMP: {
      TITLE: "Augmentation rapide de la température de la batterie",
      CONTENT: "<h1>La température de la batterie augmente rapidement</h1><p>La température de la batterie a augmenté de plus de 1&deg; très rapidement.<br/>La température de votre batterie : {{temp}}&deg avec une augmentation de {{increase}}&deg;.</p>"
    },
    LOW_12V: {
      TITLE: "Batterie 12v faible",
      CONTENT: "<h1>Faites vérifiez votre batterie 12V!</h1><p>Il semble que la batterie 12V est faible. <br/>La température de votre batterie 12V: {{volts}} volts. </p>"
    },
    LOW_TRACTION: {
      TITLE: "Niveau de batterie faible",
      CONTENT: "<h1>Niveau de batterie faible!</h1><p>Vous n'avez presque plus d'énergie! Trouvez vous un chargeur rapidement!<br/>Votre niveau de batterie: {{SOC}}%. </p>"
    },
    LOW_HX: {
      TITLE: "HX Bas",
      CONTENT: "<h1>Le niveau HX de la batterie est bas</h1><p>Le niveau HX de la batterie est relié à la santé de votre batterie, consultez votre concessionnaire Nissan rapidement.<br/>Le niveau HX de votre batterie: {{hx}}%. </p>"
    },
    LOW_OUTSIDE_TEMP: {
      TITLE: "Température extérieure froide",
      CONTENT: "<h1>Température extérieure froide</h1><p>Soyez prudent, vous pourriez rencontrer de la glace noire et plus d'énergie sera nécessaire pour votre parcours, ne vous fiez pas à l'estimé. Température extérieure: {{temp}}&deg. </p>"
    },
    HIGH_OUTPUT: {
      TITLE: "Puissance maximale",
      CONTENT: "<h1>Puissance maximale utilisé</h1><p>Soyez prudent, si vous accélérez trop rapidement fréquemment ca pourrait endommager votre batterie plus rapidement. <br/>Évitez les accélérations rapides pour vous assurez d'une plus grande longévité de batterie. Puissance moteur à {{watts}}Wh</p>"
    },
    TIRES: {
      R_FRONT: "Avant droit",
      L_FRONT: "Avant gauche",
      R_REAR: "Arrière droit",
      L_REAR: "Arrière gauche"
    },
    HIGH_TIRE: {
      TITLE: "{{tire}} Pression pneu élevé",
      CONTENT: "<h1>High {{tire}} Pression pneu élevé</h1><p>Une pression des pneus élevé peu diminuer l'efficacité.<br/>{{tire}} Pression pneu à: {{value}} psi. </p>",
    },
    LOW_TIRE: {
      TITLE: "{{tire}} Pression pneu basse",
      CONTENT: "<h1>Low {{tire}} Pression pneu</h1><p>Une pression des pneus basse peu diminuer l'efficacité.<br/>{{tire}} Pression pneu à: {{value}} psi. </p>"
    }
  },
  SETTINGS: {
    TABS: {
      SETTINGS: "Paramètres",
      DATA: "Les données",
      ABOUT: "Sur"
    },
    TITLE: "Gérer",
    NOTIFICATIONS: {
      TITLE: "Notifications",
      ENABLE_DEVICE: "Envoyez notifications à Android"
    },
    DISPLAY: {
      TITLE: "Affichage",
      EXTRA_DATA: "Cacher données supplémentaires",
      EXTRA_DATA_DETAIL: "Augmente les performances",
      LANGUAGE: {
        ENGLISH: "Anglais",
        FRENCH: "Français",
        TITLE: "La langue"
      }
    },
    DARK_MODE: {
      TITLE: "Theme/Mode sombre",
      AMBIENT: "Sonde lumière ambiante",
      AMBIENT_SENSITIVITY: "Sonde sensible à la lumière",
      DARK_HEADLIGHTS: "Activation Sombre avec phares"
    },
    EXPERIMENTAL: {
      TITLE: "Expérimental",
      SAVE_OBD: "Sauvegarder fichier log OBD",
      SAVE_HISTORY: "Sauvegarder fichier historique",
      DEBUG_CODES: "Envoyer code diagnostique",
      DEBUG_EXPLAIN: "(Très lent)"
    },
    DATA: {
      CLEAR: "Nettoyez historique",
      DELETE: "Effacer"
    }
  }
};

happyLeaf.config(['$translateProvider', function($translateProvider) {
  $translateProvider
    .translations('en', translationsEN)
    .translations('fr', translationsFR)
    .registerAvailableLanguageKeys(['en', 'fr'], {
      'en_US': 'en',
      'en_UK': 'en',
      'de_DE': 'de',
      'de_CH': 'de',
      'fr-BE': 'fr',
      'fr-CA': 'fr',
      'fr-FR': 'fr',
      'fr-LU': 'fr'
    })
    .determinePreferredLanguage();
}]);
