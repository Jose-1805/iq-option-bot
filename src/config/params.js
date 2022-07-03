const params = {
    connectionStates: {
        disconnected: 0,
        connecting: 1,
        connected: 2,
        disconnecting: 3,
    },
    connectionStateNames: {
        0: "desconectado",
        1: "conectando",
        2: "conectado",
        3: "desconectando",
    },
    configurationStates: {
        no_applied: 0,
        applying: 1,
        applied: 2,
    },
    configurationStateNames: {
        0: "configuración no aplicada",
        1: "aplicando configuración",
        2: "configuración aplicada",
    },
    item_pattern_length: 5,
};

export default params;
