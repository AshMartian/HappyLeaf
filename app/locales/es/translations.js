export default {
  WELCOME: {
    TITLE: 'Bienvenido',
    LOADING_TEXT: 'Cargando..',
    SCANNING: "Buscando...",
    CONNECTING: 'Conectando, {{name}}',
    CONNECTED: 'Conectado!',
    DISCONNECTED: 'No se pudo conectar al dispositivo',
    NO_BLUETOOTH: 'No se pudo encontrar la interfaz Bluetooth',
    WIFI_ERROR: "No se pudo conectar a la red",
    TESTING: 'Probando...',
    SUCCESS: 'Conectado a {{output}}!',
    FOUND: 'Encontrado {{length}} dispositivos emparejados',
    DEVICES: 'Dispositivos',
    DEVICE_TIPS: "Si no ve su OBD, empareje un dispositivo en Configuración -> Bluetooth de su sistema operativo. <br/> Asegúrese de que ninguna otra aplicación esté utilizando su dispositivo Bluetooth.",
    BLUETOOTH_ERROR: {
      TITLE: "OBD Bluetooth necesario",
      CONTENT: "Bluetooth debe estar activo para comunicarse con el dispositivo OBD",
      RETRY: "Inténtelo de nuevo"
    },
    OFFLINE_WARNING: {
      TITLE: "Modo sin conexión",
      CONTENT: "Actualmente no está conectado a un dispositivo OBD, se cargaran los últimos datos del historial conocidos. Si el último dispositivo Bluetooth conectado está en rango, se intentará reconectarse automáticamente",
      CONTINUE: "Continuar"
    }
  },
  HOME: {
    TITLE: "Happy Leaf",
    USED: "Usado",
    REMAINING: "Restante",
    GAINED: "Ganado",
    HAPPY: "Feliz",
    TODAY: "Hoy",
    TO: "a",
    YES: "Si",
    NO: "No",
    HEALTH: "Salud",
    SINCE: "desde",
    WATTS_MIN: "Watts por min",
    MENUS: {
      TO_DARK: "Cambiar a oscuro",
      TO_LIGHT: "Switch a claro",
      USE_WATTS: "Vatio usados/{{units}}",
      USE_KW: "{{units}} usados/kW",
      RESET: "Reiniciar",
      EXPLAIN: "Explicar",
      OUT_FULLSCREEN: "Salir de pantalla completa",
      TO_FULLSCREEN: "Entrar a pantalla completa"
    },
    RESET_WARNING: {
      TITLE: 'Reiniciar el medidor de vatios?',
      CONTENT: 'Esto restablecerá la medida actual de Wvatios y establecerá la hora de inicio de vatios hasta ahora. ¿Estás seguro?',
      CONTINUE: 'Si, reiniciar!',
      NEVERMIND: 'No'
    },
    EXPLAIN_METER: {
      TITLE: 'Neddor de vatios',
      CONTENT: 'Los vatios son la medida de la transferencia de energía, siendo capaz de rastrear el uso de vatios es clave para aumentar la eficiencia. Este widget mide el cambio de vatios de un tiempo especificado, y puede ser restablecido en cualquier momento.',
      OKAY: 'Lo tengo!'
    }
  },
  LEAF_DISPLAY: {
    SOC: "Estado de la carga",
    MOTOR: "Motor",
    CLIMATE: "Climatizado"
  },
  NOTIFICATIONS: {
    CLEAR_ALL: "Borrar todo",
    NONE_YET: "Todavía no hay notificaciones !",
    RESET_DIALOG: {
      TITLE: 'Restablecer todas las notificaciones?',
      CONTENT: 'Esto borrará permanentemente todas las notificaciones actuales, ¿estás seguro?',
      OKAY: 'Si, borrar!',
      NEVERMIND: 'No'
    },
    HIGH_BAT_TEMP: {
      TITLE: "Temperatura alta de la batería",
      CONTENT: "<h1>Alta temperatura de la batería</h1><p>Las temperaturas altas de las baterías pueden causar daños irreversibles, evitar la carga rápida hasta que la batería se enfríe. <br/> La temperatura de la batería se ha leído a las {{temp}}&deg. </p>"
    },
    LOW_BAT_TEMP: {
      TITLE: "Temperatura baja de la batería",
      CONTENT: "<h1>emperatura baja de la batería </ h1> <p> Las temperaturas bajas de las baterías pueden causar daños irrivibles.Conecte a un cargador para activar el calentador de la batería. <br/> La temperatura de la batería fue leída a las {{temp}}&deg. </p>"
    },
    RAPID_TEMP: {
      TITLE: "Rapid Battery Temperature Increase",
      CONTENT: "<h1>La temperatura de la batería aumentó rápidamente </ h1> <p> La temperatura de la batería ha aumentado en más de 1&deg; muy rápidamente.<br/>Se leyó la temperatura de la batería a las : {{temp}}&deg con el aumento de {{increase}}&deg;. </p>"
    },
    LOW_12V: {
      TITLE: "Batería 12v baja",
      CONTENT: "<H1> Compruebe la batería! </ H1> <p> Parece que su batería de 12v está baja. <br/> Se leyó la batería a las : {{volts}} volts. </p>"
    },
    LOW_TRACTION: {
      TITLE: "Batería baja",
      CONTENT: "<h1> ¡Carga de batería baja! </ H1> <p> ¡Se está quedando sin energía! ¡Acceda rápidamente a un cargador! <br/> Se leyó su batería a las : {{SOC}}%. </p>"
    },
    LOW_HX: {
      TITLE: "HX bajo",
      CONTENT: "<h1> La batería HX es baja </ h1> <p> X se correlaciona con la salud, y se ve bajo. <br/> Su batería HX fue leída a las : {{hx}}%. </p>"
    },
    LOW_OUTSIDE_TEMP: {
      TITLE: "Cuidado con el hielo",
      CONTENT: "<h1> Baja temperatura exterior </ h1> <p> Está por debajo de la congelación en el exterior, observe Ice. La temperatura exterior se ha leído a las : {{temp}}&deg. </p>"
    },
    HIGH_OUTPUT: {
      TITLE: "Alto rendimiento de la batería ",
      CONTENT: "<h1> Salida de batería alta </ h1> <p> Puede ser divertido acelerar rápidamente, pero esto podría ser perjudicial para la batería. <br/> Evite la aceleración rápida para asegurar la máxima duración de la batería. La salida del motor se leyó en  {{watts}}Wh</p>"
    },
    TIRES: {
      R_FRONT: "Frontal derecho",
       L_FRONT: "Delantero izquierdo",
       R_REAR: "Derecha trasera",
       L_REAR: "Izquierda trasera"
    },
    HIGH_TIRE: {
      TITLE: "{{tire}} Presión de los neumáticos alta",
      CONTENT: "<h1>High {{tire}} Tire pressure</h1><p>Las presiones de los neumáticos alta pueden causar una mala eficiencia.<br/>El neumático {{tire}} fue leído con {{value}} psi.<br />El umbral actual es {{threshold}}. </p>",
    },
    LOW_TIRE: {
      TITLE: "{{tire}} Presión de los neumáticos baja",
      CONTENT: "<h1>Low {{tire}} Tire pressure</h1><p>Las presiones de los neumáticos bajos pueden causar una mala eficienciay<br/>El neumático {{tire}} fue leído con {{value}} psi<br/>El umbral actual es {{threshold}}. </p>"
    },
    TIRE_DELTA: {
      TITLE: "Delta del neumático alto",
      CONTENT: "<h1>Tire Delta {{value}}</h1><p>Esto es más que el umbral definido de {{threshold}}. La diferencia de PSI entre el neumático más inflado y el neumático menos inflado es {{value}}</p>"
    }
  },
  SETTINGS: {
    TABS: {
      SETTINGS: "Configuración",
      DATA: "Datos",
      ABOUT: "Sobre",
      CONNECTION: "Conexión"
    },
    DELETE_CONFIRM: {
      TITLE: 'Eliminar todo el historial?',
      CONTENT: 'Esto borrará permanentemente todo el historial de hoy, si no tiene los registros habilitados, estos datos se perderán para siempre. ¿Estás seguro?',
      CONFIRM: 'Si, borrar',
      NEVERMIND: 'No'
    },
    TITLE: "Gestionar",
    NOTIFICATIONS: {
      TITLE: "Notificaciones",
      ENABLE_DEVICE: "Enviar notificaciones al sistema operativo",
      TIRE_HIGH_THRESHOLD: "Alto neumático PSI",
      TIRE_LOW_THRESHOLD: "Low PSI de los neumáticos",
      TIRE_DELTA_THRESHOLD: "Límite del Delta del neumático"
    },
    DISPLAY: {
      TITLE: "Monitor",
       EXTRA_DATA: "Ocultar datos adicionales",
       EXTRA_DATA_DETAIL: "Mejorará el rendimiento",
       EXTRA_LOGS: "Ocultar registros",
       EXTRA_LOGS_DETAIL: "Mejorará el rendimiento, deshabilitará la visualización solamente.",
      LANGUAGE: {
        ENGLISH: "English",
        FRENCH: "French",
        RUSSIAN: "Russian",
        SPANISH: "Español",
        PORTUGUESE: "Portuguese",
        TITLE: "Idiomas",
      }
    },
    DARK_MODE: {
      TITLE: "Tema / Modo oscuro ",
      AMBIENT: "Sensor de luz ambiental",
       AMBIENT_SENSITIVITY: "Sensibilidad a la luz ambiental",
       DARK_HEADLIGHTS: "Activar oscuro con faros"
    },
    EXPERIMENTAL: {
      TITLE: "Experimental",
       SAVE_OBD: "Guardar archivo de registro OBD",
       SAVE_HISTORY: "Guardar archivo de registro del historial",
       DEBUG_CODES: "Enviar códigos de depuración",
       DEBUG_EXPLAIN: "(muy lento)"
    },
    DATA: {
      CLEAR: "Borrar el historial",
      DELETE: "Borrar",
      LOG_LOCATION: "Encuentra más registros en {{location}}"
    },
    WIFI: {
      TITLE: "Wifi",
      IP: "Dirección IP",
      PORT: "Número de puerto"
    },
    BLUETOOTH: {
      TITLE: "Bluetooth"
    }
  }
};
