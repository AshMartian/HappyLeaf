var translationsEN = {
  WELCOME: {
    TITLE: 'Welcome',
    LOADING_TEXT: 'Loading...',
    SCANNING: "Scanning...",
    CONNECTING: 'Connecting, {{name}}',
    CONNECTED: 'Connected!',
    DISCONNECTED: 'Could not connect to device',
    NO_BLUETOOTH: 'Could not find Bluetooth interface',
    WIFI_ERROR: "Could not connect to network",
    TESTING: 'Testing...',
    SUCCESS: 'Connected to {{output}}!',
    FOUND: 'Found {{length}} paired devices',
    DEVICES: 'Devices',
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
      EXPLAIN: "Explain",
      OUT_FULLSCREEN: "Exit Fullscreen",
      TO_FULLSCREEN: "Enter Fullscreen"
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
      CONTENT: "<h1>High {{tire}} Tire pressure</h1><p>High tire pressures may cause poor efficiency.<br/>{{tire}} tire was read at: {{value}} psi.<br />Current threshold is {{threshold}}. </p>",
    },
    LOW_TIRE: {
      TITLE: "{{tire}} Tire Pressure Low",
      CONTENT: "<h1>Low {{tire}} Tire pressure</h1><p>Low tire pressures may cause poor efficiency<br/>{{tire}} tire was read at: {{value}} psi.<br/>Current threshold is {{threshold}}. </p>"
    },
    TIRE_DELTA: {
      TITLE: "High Tire Delta",
      CONTENT: "<h1>Tire Delta {{value}}</h1><p>This is more than the defined threshold of {{threshold}}. The PSI difference between the most inflated tire and least inflated tire is {{value}}</p>"
    }
  },
  SETTINGS: {
    TABS: {
      SETTINGS: "Settings",
      DATA: "Data",
      ABOUT: "About",
      CONNECTION: "Connection"
    },
    DELETE_CONFIRM: {
      TITLE: 'Delete all history?',
      CONTENT: 'This will perminantly delete all history for today, if you do not have logs enabled, this data will be lost forever. Are you sure?',
      CONFIRM: 'Yes, reset!',
      NEVERMIND: 'Nevermind'
    },
    TITLE: "Manage",
    NOTIFICATIONS: {
      TITLE: "Notifications",
      ENABLE_DEVICE: "Send notifications to OS",
      TIRE_HIGH_THRESHOLD: "High Tire PSI",
      TIRE_LOW_THRESHOLD: "Low Tire PSI",
      TIRE_DELTA_THRESHOLD: "Tire Delta Limit"
    },
    DISPLAY: {
      TITLE: "Display",
      EXTRA_DATA: "Hide extra data",
      EXTRA_DATA_DETAIL: "Will improve performance",
      EXTRA_LOGS: "Hide Logs",
      EXTRA_LOGS_DETAIL: "Will improve performance. Disable display only.",
      LANGUAGE: {
        ENGLISH: "English",
        FRENCH: "French",
        RUSSIAN: "Russian",
        PORTUGUESE: "Portuguese",
        TITLE: "Language",
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
      DELETE: "Delete",
      LOG_LOCATION: "Find more logs at {{location}}"
    },
    WIFI: {
      TITLE: "Wifi",
      IP: "IP Address",
      PORT: "Port Number"
    },
    BLUETOOTH: {
      TITLE: "Bluetooth"
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


var translationsRU = {
  WELCOME: {
    TITLE: 'Добро пожаловать',
    LOADING_TEXT: 'Загрузка...',
    SCANNING: "Сканирование...",
    CONNECTING: 'Соединение...',
    CONNECTED: 'Подсоединено!',
    TESTING: 'Тестирование...',
    SUCCESS: 'Подсоединено к {{output}}!',
    FOUND: 'Найдено {{length}} сопряженных устройства',
    DEVICE_TIPS: "Если вы не увидели ваше ODB устройство, установите сопряжение в Настройки -> Bluetooth в вашей OS.<br/>Убедитесь, что другие приложения не используют Bluetooth.",
    BLUETOOTH_ERROR: {
      TITLE: "Требуется ODB Bluetooth устройство",
      CONTENT: "Bluetooth должен быть включен для соединения с OBD устройством.",
      RETRY: "Попробовать еще"
    },
    OFFLINE_WARNING: {
      TITLE: "Оффлайн режим",
      CONTENT: "В данный момент нет подключения к OBD устройству. Будут загружены последние данные из истории. Если последнее подсоединенное устройство bluetooth доступно, попытка переподключения произойдет автоматически.",
      CONTINUE: "Продолжить"
    }
  },
  HOME: {
    TITLE: "Happy Leaf",
    USED: "Использовано",
    REMAINING: "Осталось",
    GAINED: "Получено",
    HAPPY: "Счастливый",
    TODAY: "Сегодня",
    TO: "к",
    YES: "Да",
    NO: "Нет",
    HEALTH: "Здоровье",
    SINCE: "с",
    WATTS_MIN: "Ватт/мин.",
    MENUS: {
      TO_DARK: "Переключить на темную",
      TO_LIGHT: "Переключить на светлую",
      USE_WATTS: "Использовать Ватты/{{units}}",
      USE_KW: "Использовать {{units}}/кВатт",
      RESET: "Сброс",
      EXPLAIN: "Пояснение"
    },
    RESET_WARNING: {
      TITLE: 'Сбросить Ваттметр?',
      CONTENT: 'Это очистит ваши текущие показания Ваттметра и установит текущее время старта. Вы уверены? ',
      CONTINUE: 'Да, сбросить!',
      NEVERMIND: 'Не нужно'
    },
    EXPLAIN_METER: {
      TITLE: 'Ваттметр',
      CONTENT: 'Ватты являются измерением передачи энергии, и могут отследить потребление для повышения эффективности. Этот виджет измеряет изменение Ваттов за промежуток времени и может быть сброшен в любое время.',
      OKAY: 'Понял!'
    }
  },
  LEAF_DISPLAY: {
    SOC: "Уровень заряда (SOC)",
    MOTOR: "Двигатель",
    CLIMATE: "Климат"
  },
  NOTIFICATIONS: {
    CLEAR_ALL: "Очистить все",
    NONE_YET: "Нет напоминаний!",
    RESET_DIALOG: {
      TITLE: 'Очистить все уведомления?',
      CONTENT: 'Это действие полностью очистит все текущие уведомления, вы уверены? ',
      OKAY: 'Да, очистить!',
      NEVERMIND: 'Не нужно'
    },
    HIGH_BAT_TEMP: {
      TITLE: "Высокая температура батареи",
      CONTENT: "<h1>Высокая температура батареи</h1><p>Высокая температура батареи может нанести необратимый ущерб, не используйте быстрые зарядки до охлаждения батареи.<br/> Температура батареи: {{temp}}&град. </p>"
    },
    LOW_BAT_TEMP: {
      TITLE: "Низкая температура батареи",
      CONTENT: "<h1>Низкая температура батареи</h1><p> Низкая температура батареи может нанести необратимый ущерб. Подсоедините зарядное устройство для активации обогревателя батареи. <br/>Температура батареи: {{temp}}&град. </p>"
    },
    RAPID_TEMP: {
      TITLE: "Быстрое увеличение температуры батареи",
      CONTENT: "<h1>Температура батареи растет слишком быстро</h1><p>Температура батареи увеличилась на 1&град.; слишком быстро.<br/> Температура батареи: {{temp}}&град. с увеличением на  {{increase}}&град;. </p>"
    },
    LOW_12V: {
      TITLE: "12v Аккумулятор разряжен",
      CONTENT: "<h1>Проверьте 12v аккумулятор!</h1><p>Кажется, что ваш 12v аккумулятор разряжен. <br/>Уровень его заряда: {{volts}} ваольт. </p>"
    },
    LOW_TRACTION: {
      TITLE: "Батарея разряжена",
      CONTENT: "<h1>Низкий заряд батареи!</h1><p>У вас кончается заряд! Быстро найдите зарядное устройство! <br/>Уровень заряда батареи: {{SOC}}%. </p>"
    },
    LOW_HX: {
      TITLE: "Низкий HX",
      CONTENT: "<h1>Показатель HX батареи низкий</h1><p>HX показывает здоровье батареи, и он, похоже, низкий.<br/>Уровень HX батареи: {{hx}}%. </p>"
    },
    LOW_OUTSIDE_TEMP: {
      TITLE: "Внимание, возможен гололёд",
      CONTENT: "<h1>Низкая температура снаружи</h1><p>Температура ниже 0, возможен гололед. Температура снаружи: {{temp}}&град. </p>"
    },
    HIGH_OUTPUT: {
      TITLE: "Высокое потребление энергии",
      CONTENT: "<h1>Высокий расход батареи</h1><p>Наверняка быстро ездить весело, но этом может нанести вред вашей батарее.<br/>Избегайте быстрого разгона чтобы продлить срок службы батареи как можно дольше. Потребление энергии: {{watts}}Ватт/час</p>"
    },
    TIRES: {
      R_FRONT: "Передняя Правая",
      L_FRONT: "Передняя Левая",
      R_REAR: "Задняя Правая",
      L_REAR: "Задняя Левая"
    },
    HIGH_TIRE: {
      TITLE: "{{tire}} Высокое давление в шине",
      CONTENT: "<h1>Высокое {{tire}} давление в шине</h1><p>Высокое давление снижает эффективность и увеличивает потребление энергии<br/>{{tire}} давление в шине: {{value}} psi. </p>",
    },
    LOW_TIRE: {
      TITLE: "{{tire}} Низкое давление в шине",
      CONTENT: "<h1> Низкое {{tire}} давление в шине</h1><p>Низкое давление снижает эффективность и увеличивает потребление энергии<br/>{{tire}} давление в шине: {{value}} psi. </p>"
    }
  },
  SETTINGS: {
    TABS: {
      SETTINGS: "Настройки",
      DATA: "Данные",
      ABOUT: "О программе"
    },
    TITLE: "Управление",
    NOTIFICATIONS: {
      TITLE: "Уведомления",
      ENABLE_DEVICE: "Отправлять уведомления в OS",
      TIRE_LOW_THRESHOLD: "Низкая шина PSI",
      TIRE_HIGH_THRESHOLD: "Высокие шины PSI"
    },
    DISPLAY: {
      TITLE: "Экран",
      EXTRA_DATA: "Спрятать дополнительную информацию",
      EXTRA_DATA_DETAIL: "Увеличит быстродействие",
      LANGUAGE: {
        ENGLISH: "Английский",
        FRENCH: "Французский",
        RUSSIAN: "русский",
        TITLE: "Language"
      }
    },
    DARK_MODE: {
      TITLE: "Тёмная тема",
      AMBIENT: "Датчик освещенности",
      AMBIENT_SENSITIVITY: "Чувствительность датчика освещенности",
      DARK_HEADLIGHTS: "Включить темную тему с ближним светом"
    },
    EXPERIMENTAL: {
      TITLE: "Экспериментальные настройки",
      SAVE_OBD: "Сохранить OBD log-файл",
      SAVE_HISTORY: "Сохранить Историю в файл",
      DEBUG_CODES: "Показать отладочные коды",
      DEBUG_EXPLAIN: "(очень медленно)"
    },
    DATA: {
      CLEAR: "Очистить Историю",
      DELETE: "Удалить"
    }
  }
};


var translationsPT = {
  WELCOME: {
    TITLE: 'Bem vindo',
    LOADING_TEXT: 'A carregar...',
    SCANNING: "A detectar...",
    CONNECTING: 'A ligar...',
    CONNECTED: 'Ligado!',
    TESTING: 'A testar...',
    SUCCESS: 'Ligado a {{output}}!',
    FOUND: 'Encontrados {{length}} dispositivos emparelhados',
    DEVICE_TIPS: "Se n„o vir o seu dispositivo OBD, emparelhe em DefiniÁıes -> Bluetooth no seu SO.<br/>Certifique-se que n„o h· outra App a usar o seu dispositivo Bluetooth.",
    BLUETOOTH_ERROR: {
      TITLE: "Necess·rio um ODB Bluetooth",
      CONTENT: "O Bluetooth tem de estar ligado para comunicar com o dispositivo OBD.",
      RETRY: "Tente novamente"
    },
    OFFLINE_WARNING: {
      TITLE: "Modo Offline",
      CONTENT: "Desligado de qualquer dispositivo OBD. Ser„o carregados os dados da ultima ligaÁ„o. Ser· tentada a ligaÁ„o ao ultimo dispositivo ligado se estiver ao alcance.",
      CONTINUE: "Continuar"
    }
  },
  HOME: {
    TITLE: "Happy Leaf",
    USED: "Usado",
    REMAINING: "Remanescente",
    GAINED: "Ganho",
    HAPPY: "Happy",
    TODAY: "Hoje",
    TO: "para",
    YES: "Sim",
    NO: "N„o",
    HEALTH: "Sa˙de",
    SINCE: "desde",
    WATTS_MIN: "Watts por min",
    MENUS: {
      TO_DARK: "Mudar para escuro",
      TO_LIGHT: "Mudar para claro",
      USE_WATTS: "Usar Watts/{{units}}",
      USE_KW: "Usar {{units}}/kW",
      RESET: "Limpar",
      EXPLAIN: "ExplicaÁ„o"
    },
    RESET_WARNING: {
      TITLE: 'Limpar o medidor de Watts?',
      CONTENT: 'Isto vai limpar as mediÁıes atuais de Watts e recomÁar. Tem a certeza?',
      CONTINUE: 'Sim, limpar!',
      NEVERMIND: 'N„o limpar'
    },
    EXPLAIN_METER: {
      TITLE: 'Medidor de Watts',
      CONTENT: 'Watt È a medida de transferÍncia de energia, ser capaz de medir a utilizaÁ„o dos Watts È essencial para aumentar a eficiÍncia. Este widget mede as alteraÁıes de Watts a partir de determinada altura e pode ser inicializado em qualquer momento.',
      OKAY: 'Percebi!'
    }
  },
  LEAF_DISPLAY: {
    SOC: "Estado da carga",
    MOTOR: "Motor",
    CLIMATE: "Climatiz."
  },
  NOTIFICATIONS: {
    CLEAR_ALL: "Limpar tudo",
    NONE_YET: "Ainda sem notificaÁıes!",
    RESET_DIALOG: {
      TITLE: 'Limpar todas as notificaÁıes?',
      CONTENT: 'Isto vai limpar de vez todas as notificaÁıes atuais, tem a certeza?',
      OKAY: 'Sim, limpar!',
      NEVERMIND: 'N„o limpar'
    },
    HIGH_BAT_TEMP: {
      TITLE: "Temperatura da bateria alta",
      CONTENT: "<h1>Temperatura da bateria alta</h1><p>Temperaturas de bateria altas podem causar danos irreversÌveis, evite carregamentos r·pidos atÈ a bateria arrefecer.<br/>Temperatura da bateria: {{temp}}&deg. </p>"
    },
    LOW_BAT_TEMP: {
      TITLE: "Temperatura da bateria baixa",
      CONTENT: "<h1>Temperatura da bateria baixa</h1><p>Temperaturas de bateria baixas podem causar danos irreversÌveis. Ligue a um carregador para ativar o aquecedor da bateria. <br/>Temperatura da bateria: {{temp}}&deg. </p>"
    },
    RAPID_TEMP: {
      TITLE: "Aumento r·pido da temperatura da bateria",
      CONTENT: "<h1>A temperatura da bateria aumentou rapidamente</h1><p>A temperatura da bateria aumentou 1&deg; muito r·pido.<br/>Temperatura da bateria: {{temp}}&deg aumentou {{increase}}&deg;. </p>"
    },
    LOW_12V: {
      TITLE: "Bateria de 12v com pouca carga",
      CONTENT: "<h1>Verifique a bateria de 12v!</h1><p>A bateria de 12v est· com pouca carga. <br/>Voltagem da bateria de 12v: {{volts}} volts. </p>"
    },
    LOW_TRACTION: {
      TITLE: "Bateria com pouca carga",
      CONTENT: "<h1>A carga da bateria est· baixa!</h1><p>Est· a ficar sem energia! Encontre um carregador r·pidamente! <br/>Carga da bateria: {{SOC}}%. </p>"
    },
    LOW_HX: {
      TITLE: "HX baixo",
      CONTENT: "<h1>O HX da bateria est· baixo</h1><p>O HX È uma medida relacionada com a sa˙de da bateria e est· baixo.<br/>HX da bateria: {{hx}}%. </p>"
    },
    LOW_OUTSIDE_TEMP: {
      TITLE: "Perigo, gelo",
      CONTENT: "<h1>Temperaturas baixas l· fora</h1><p>Est· muito frio l· fora, cuidado com o gelo. A temperatura exterior È: {{temp}}&deg. </p>"
    },
    HIGH_OUTPUT: {
      TITLE: "Descarga r·pida de bateria",
      CONTENT: "<h1>Descarga r·pida de bateria</h1><p>Pode ser divertido fazer aceleraÁıes r·pidas mas isso È prejudicial para a bateria.<br/>Evite aceleraÁıes r·pidas para assegurar maior longevidade. A descarga do motor foi de {{watts}}Wh</p>"
    },
    TIRES: {
      R_FRONT: "frente direita",
      L_FRONT: "frente esquerda",
      R_REAR: "traseira direita",
      L_REAR: "traseira esquerda"
    },
    HIGH_TIRE: {
      TITLE: "Pneu da {{tire}} tem demasiada press„o",
      CONTENT: "<h1>A press„o do pneu da {{tire}} est· alta</h1><p>Pneus com muita press„o causam fraca eficiÍncia<br/>O pneu da {{tire}} tem: {{value}} psi. </p>",
    },
    LOW_TIRE: {
      TITLE: "Pneu da {{tire}} tem pouca press„o",
      CONTENT: "<h1>A press„o do pneu da {{tire}} est· baixa</h1><p>Pneus com pouca press„o causam fraca eficiÍncia<br/>O pneu da {{tire}} tem: {{value}} psi. </p>"
    }
  },
  SETTINGS: {
    TABS: {
      SETTINGS: "ConfiguraÁıes",
      DATA: "Dados",
      ABOUT: "Acerca"
    },
    TITLE: "Gest„o",
    NOTIFICATIONS: {
      TITLE: "NotificaÁıes",
      ENABLE_DEVICE: "Enviar notificaÁıes para o SO",
      TIRE_HIGH_THRESHOLD: "Press„o m·xima",
      TIRE_LOW_THRESHOLD: "Press„o minima",
      TIRE_DELTA_THRESHOLD: "DiferenÁa de press„o"
    },
    DISPLAY: {
      TITLE: "Display",
      EXTRA_DATA: "Esconder dados extra",
      EXTRA_DATA_DETAIL: "Melhora o desempenho",
      LANGUAGE: {
        ENGLISH: "English",
        FRENCH: "French",
        PORTUGUESE: "PortuguÍs",
        TITLE: "Lingua"
      }
    },
    DARK_MODE: {
      TITLE: "Modo escuro",
      AMBIENT: "Sensor de luz ambiente",
      AMBIENT_SENSITIVITY: "Sensibilidade ‡ luz ambiente",
      DARK_HEADLIGHTS: "Activar escuro com farÛis"
    },
    EXPERIMENTAL: {
      TITLE: "Experimental",
      SAVE_OBD: "Gravar ficheiro de log OBD",
      SAVE_HISTORY: "Gravar ficheiro de histÛrico do log",
      DEBUG_CODES: "Enviar cÛdigos de depuraÁ„o",
      DEBUG_EXPLAIN: "(muito lento)"
    },
    DATA: {
      CLEAR: "Limpar histÛria",
      DELETE: "Apagar"
    }
  }
};

happyLeaf.config(['$translateProvider', function($translateProvider) {
  $translateProvider
    .translations('en', translationsEN)
    .translations('fr', translationsFR)
    .translations('ru', translationsRU)
    .translations('pt', translationsPT)
    .registerAvailableLanguageKeys(['en', 'fr', 'ru', 'pt'], {
      'en_US': 'en',
      'en_UK': 'en',
      'de_DE': 'de',
      'de_CH': 'de',
      'fr-BE': 'fr',
      'fr-CA': 'fr',
      'fr-FR': 'fr',
      'fr-LU': 'fr',
      'ro': 'ru',
      'rm': 'ru',
      'qu': 'ru',
      'pt_PT': 'pt',
      'pt_BR': 'pt'
    })
    .determinePreferredLanguage()
    .fallbackLanguage('en');;
}]);
