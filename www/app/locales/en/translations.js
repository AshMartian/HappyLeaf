export default {
  WELCOME: {
    TITLE: 'Welcome',
    LOADING_TEXT: 'Loading...',
    SCANNING: "Scanning...",
    CONNECTING: 'Connecting, {{name}}',
    CONNECTED: 'Connected!',
    DISCONNECTED: 'Could not connect to device',
    NO_BLUETOOTH: 'Could not find Bluetooth interface',
    CONNECTION_FAILED: "Connection failed",
    TIMEOUT: "connection timeout",
    WIFI_ERROR: "Could not connect to network",
    TESTING: 'Testing...',
    UNKNOWN: 'Unknown Name',
    SUCCESS: 'Connected to {{output}}!',
    FOUND: 'Found {{length}} paired devices',
    DEVICES: 'Nearby Devices',
    DEVICE_TIPS: "If you do not see your OBD, pair a device in Settings -> Bluetooth of your OS.<br/>Ensure no other applications are using your Bluetooth device.",
    BLUETOOTH_ERROR: {
      TITLE: "OBD Bluetooth Needed",
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
    WATTS_MIN: "Wh per min",
    UPDATED: "Updated ",
    MILES: "Miles",
    KILOMETERS: "Km",
    TEMPC: "Celsius",
    TEMPF: "Fahrenheit",
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
      CONTENT: "<h1>Battery HX is low</h1><p>HX is corrilated to battery resistance and may affect health and efficiency. <hr/> The meaning of this number is not fully understood but it appears to be inversely related to the battery internal resistance. As the internal resistance of the battery pack increases, this percentage decreases. As internal resistance increases more energy is lost within the battery and the pack heats up more under load.<br/><br/>Your battery HX was read at: {{hx}}%. <br/><br/>Tip: Quick charging or rapid acceleration may temporarily improve HX.</p>"
    },
    LOW_OUTSIDE_TEMP: {
      TITLE: "Watch For Ice",
      CONTENT: "<h1>Low temp outside</h1><p>It is below freezing outside, watch for Ice. Outside temp was read at: {{temp}}&deg. </p>"
    },
    HIGH_OUTPUT: {
      TITLE: "High Battery Output",
      CONTENT: "<h1>High Battery Output</h1><p>It may be fun to rapidly accelerate but this could be harmful to your battery.<br/>Avoid rapid acceleration to ensure maximum battery longevity. Your motor output was read at {{watts}}Wh</p>"
    },
    SOH_CHANGE: {
      TITLE: "State of Health Changed",
      CONTENT: "<h1>State of Health Changed</h1><p>Previous State of Health {{lastSOH}}%<br/>Current State of Health {{SOH}}%<br/>Odometer at change {{odometer}}.</p>"
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
      CONTENT: 'This will permanently delete all history for today, if you do not have logs enabled, this data will be lost forever. Are you sure?',
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
        SPANISH: "Spanish",
        PORTUGUESE: "Portuguese",
        TITLE: "Language",
      },
      DISTANCE: "Distance Units",
      TEMP: "Temperature Units"
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
      PORT: "Port Number",
      ALLOW: "Allow Wifi",
      ALLOW_ENABLE: "Enable Wifi on start, auto attemp connect to wifi."
    },
    BLUETOOTH: {
      TITLE: "Bluetooth"
    }
  }
};
