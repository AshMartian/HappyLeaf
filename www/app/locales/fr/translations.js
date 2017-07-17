export default {
  WELCOME: {
    TITLE: 'Bienvenue',
    LOADING_TEXT: 'Chargement...',
    SCANNING: "Recherche...",
    CONNECTING: 'Connexion...',
    CONNECTED: 'Connecté!',
    TESTING: 'Test...',
    SUCCESS: 'Connecté à {{output}}!',
    FOUND: '{{length}} dispositif trouvé',
    DEVICE_TIPS: "Si vous ne voyez pas votre OBD, couplez un périphérique dans Paramètres -> Bluetooth de votre OS. <br/> Assurez-vous qu'aucune autre application n'utilise votre périphérique Bluetooth.",
    BLUETOOTH_ERROR: {
      TITLE: "Dispositif OBD Bluetooth demandé",
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
      ENABLE_DEVICE: "Envoyez notifications à Android",
      TIRE_HIGH_THRESHOLD: "PSI à pneus hauts",
      TIRE_LOW_THRESHOLD: "Pneus bas PSI"
    },
    DISPLAY: {
      TITLE: "Affichage",
      EXTRA_DATA: "Cacher données supplémentaires",
      EXTRA_DATA_DETAIL: "Augmente les performances",
      LANGUAGE: {
        ENGLISH: "Anglais",
        FRENCH: "Français",
        RUSSIAN: "russe",
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
