import types from "./types";
import params from "../../../config/params";

const initState = {
    // Activos de los que se obtienen los patrones para analizar
    actives: {},
    /*
        {
            "1":{                
                // Primer identificador de vela registrado
                first_candle_id: null,
                // Último identificador de vela registrado
                last_candle_id: null,
                // Patrón actual del activo
                pattern: "",
                // Operación actual generada de acuerdo a las coincidencias 
                current_operation: {},
            }
        }
    */

    // Valores consultados de cada activo para comparar con los patrones
    active_values: {},
    /*
    active_values: {
        "1": [
            {
                first_candle_id: 123134454,
                last_candle_id: 123134474,
                from: 123134474,
                to: 123134474,
                values: "011,210,000...",
            },
            {
                first_candle_id: 123134454,
                last_candle_id: 123134474,
                from: 123134474,
                to: 123134474,
                values: "011,210,000...",        
            }
        ]
        ....
    },
    */

    // Datos de volumen de de cada vela de los datos de activos
    active_volumes: {},
    /*
    {
        "1": [
            { volumes: "258,255,212,215,299" },
            { volumes: "258,255,212,215,299" },
        ]
        ...
    }
    */

    // Id del activo en espera para consultar patrón
    last_active_id: null,
    // Id del activo en espera para consultar valores
    last_active_value_id: null,

    //Tamaño de la vela a trabajar
    candle_size: 60,

    // Cantidad de velas analizadas en el patrón
    pattern_length: 0,

    // Cantidad de grupos para datos de cada activo, cada grupo contiene
    // información de 1000 velas
    amount_groups: 1,

    // Ejecución automática de operaciones
    auto_start_operations: true,

    // Cuenta con la que se realizan las operaciones automáticas (demo|real)
    account: "demo",

    configuration_state: 0, //0 => configuración no aplicada, 1 => aplicando configuración, 2 => configuración aplicada

    // Patrones encontrados en los valores de datos de los activos
    pattern_analysis: {},
    /*pattern_analysis: {
        // Patrones de un sólo valor
        // El key es el valor del patrón
        "0a01," : {
            // Primer dato es cantidad de repeticiones en la misma dirección
            // Segundo dato es porcentaje de repeticiones en la misma dirección
            alza: [7, 70],
            baja: [3, 30],
            estable: [0, 0],
        }
        // Patrones de dos valores
        // El key es el valor del patrón
        "0a01,0a01," : {
            // Primer dato es cantidad de repeticiones en la misma dirección
            // Segundo dato es porcentaje de repeticiones en la misma dirección
            alza: [7, 70],
            baja: [3, 30],
            estable: [0, 0],
        }
    }*/
    traders_mood: {},
};

const active_names = {
    1: "EUR/USD",
    2: "EUR/GBP",
    3: "GBP/JPY",
    4: "EUR/JPY",
    5: "GBP/USD",
    6: "USD/JPY",
    7: "AUD/CAD",
    8: "NZD/USD",
    72: "USD/CHF",
    76: "EUR/USD (OTC)",
    77: "EUR/GBP (OTC)",
    78: "USD/CHF (OTC)",
    80: "NZD/USD (OTC)",
    81: "GBP/USD (OTC)",
    86: "AUD/CAD (OTC)",
    99: "AUD/USD",
    100: "USD/CAD",
    101: "AUD/JPY",
    102: "GBP/CAD",
    103: "GBP/CHF",
    104: "GBP/AUD",
    105: "EUR/CAD",
    107: "CAD/CHF",
    108: "EUR/AUD",
    168: "USD/NOK",
    212: "EUR/NZD",
    943: "AUD/CHF",
    944: "AUD/NZD",
    946: "EUR/CHF",
    947: "GBP/NZD",
};

const reducer = (state = initState, action) => {
    // Genera la operación adecuada para el patrón enviado
    const getCurrentOperation = (pattern, active_id) => {
        let operation = {
            active_id,
            direction: null,
            amount: 0,
            percentage: 0,
            alza: 0,
            estable: 0,
            baja: 0,
        };

        let pattern_applied = pattern;
        let data =
            pattern in state.pattern_analysis
                ? state.pattern_analysis[pattern]
                : null;

        if (!data) {
            // El patron tiene más de un elemento
            if (pattern.length / params.item_pattern_length > 1) {
                const more_patterns =
                    pattern.length / params.item_pattern_length - 1;

                for (let i = 0; i < more_patterns; i++) {
                    pattern_applied = pattern.substr(
                        params.item_pattern_length +
                            params.item_pattern_length * i
                    );

                    data =
                        pattern_applied in state.pattern_analysis
                            ? state.pattern_analysis[pattern_applied]
                            : null;

                    if (data) {
                        break;
                    }
                }
            }
        }

        if (data) {
            operation.direction =
                data.alza[0] > data.baja[0]
                    ? 2
                    : data.alza[0] < data.baja[0]
                    ? 0
                    : 1;
            operation.amount =
                data.alza[0] > data.baja[0]
                    ? data.alza[0]
                    : data.alza[0] < data.baja[0]
                    ? data.baja[0]
                    : data.estable[0];
            operation.percentage =
                data.alza[0] > data.baja[0]
                    ? data.alza[1]
                    : data.alza[0] < data.baja[0]
                    ? data.baja[1]
                    : data.estable[1];
            operation.alza = data.alza[0];
            operation.estable = data.estable[0];
            operation.baja = data.baja[0];
            operation.pattern = pattern_applied;
            operation.dates = data.dates;
            operation.volumes = data.volumes;

            let traders_mood_value = 0;
            let traders_mood = 0;
            if (active_id in state.traders_mood) {
                traders_mood_value =
                    operation.direction === 2
                        ? state.traders_mood[active_id]
                        : operation.direction === 0
                        ? 100 - state.traders_mood[active_id]
                        : 0;
                traders_mood = traders_mood_value;
                traders_mood_value += "%";
            } else {
                traders_mood_value = "SIN DATOS";
            }

            console.log(
                "NUEVA OPERACIÓN EN EL ACTIVO " +
                    active_id +
                    " **** TRADERS MOOD " +
                    traders_mood_value +
                    " **** " +
                    new Date().toLocaleString() +
                    " **** ",
                operation
            );
            const total = operation.alza + operation.estable + operation.baja;
            const queries =
                (localStorage.getItem("queries")
                    ? localStorage.getItem("queries")
                    : "") +
                "DELETE FROM operations WHERE active_id = " +
                active_id +
                " AND option_id IS NULL; INSERT INTO operations (active_id, active_name, option_type, traders_mood, direction, number_repetitions, percentage_repetitions, total_repetitions, pattern, pattern_length, info_dates, volume_data, configuration_id) VALUES (" +
                (active_id + ",'") +
                (active_id in active_names
                    ? active_names[active_id] + "',"
                    : "',") +
                "4," +
                (traders_mood + ",") +
                (operation.direction + ",") +
                (operation.amount + ",") +
                (operation.percentage + ",") +
                (total + ",'") +
                (pattern_applied + "',") +
                (pattern_applied.length / params.item_pattern_length + ",'") +
                (JSON.stringify(operation.dates) + "','") +
                (JSON.stringify(operation.volumes) + "',") +
                "1" +
                ");";
            localStorage.setItem("queries", queries);
        }

        return operation;
    };

    switch (action.type) {
        case types.ADD_ACTIVE:
            const new_actives = Object.assign({}, state.actives, {
                [action.active_id]: {
                    first_candle_id: null,
                    last_candle_id: null,
                    pattern: "",
                    coincidences: {},
                    current_operation: {},
                },
            });
            return Object.assign({}, state, {
                actives: new_actives,
            });
        case types.SET_ACTIVES:
            const set_actives = {};
            for (let i = 0; i < action.actives.length; i++) {
                set_actives[action.actives[i]] = {
                    first_candle_id: null,
                    last_candle_id: null,
                    pattern: "",
                    coincidences: {},
                    current_operation: {},
                };
            }
            return Object.assign({}, state, {
                actives: set_actives,
            });
        case types.SET_ACTIVE_VALUES:
            const set_active_values = {};
            for (let i = 0; i < action.actives.length; i++) {
                set_active_values[action.actives[i]] = [];
            }
            return Object.assign({}, state, {
                active_values: set_active_values,
            });

        case types.REMOVE_ACTIVE:
            let current_actives = Object.assign({}, state.actives, {});
            delete current_actives[action.active_id];
            return Object.assign({}, state, {
                actives: current_actives,
            });

        case types.ADD_ACTIVE_VALUE:
            const new_active_values = Object.assign({}, state.active_values, {
                [action.active_id]: [],
            });
            return Object.assign({}, state, {
                active_values: new_active_values,
            });

        case types.REMOVE_ACTIVE_VALUE:
            let current_active_values = Object.assign(
                {},
                state.active_values,
                {}
            );
            delete current_active_values[action.active_id];
            return Object.assign({}, state, {
                active_values: current_active_values,
            });

        case types.SET_LAST_ACTIVE_ID:
            return Object.assign({}, state, {
                last_active_id: action.active_id,
            });

        case types.SET_LAST_ACTIVE_VALUE_ID:
            return Object.assign({}, state, {
                last_active_value_id: action.active_id,
            });

        case types.SET_PATTERN_LENGTH:
            return Object.assign({}, state, {
                pattern_length: action.length,
            });

        case types.SET_CANDLE_SIZE:
            return Object.assign({}, state, {
                candle_size: action.size,
            });

        case types.SET_AMOUNT_GROUPS:
            return Object.assign({}, state, {
                amount_groups: action.amount,
            });

        case types.SET_AUTO_START_OPERATIONS:
            return Object.assign({}, state, {
                auto_start_operations: action.value,
            });

        case types.SET_ACCOUNT:
            return Object.assign({}, state, {
                account: action.account,
            });

        case types.SET_CONFIGURATION_STATE:
            return Object.assign(
                {},
                action.state === params.configurationStates.no_applied
                    ? initState
                    : state,
                {
                    configuration_state: action.state,
                }
            );

        case types.ADD_ACTIVE_VALUES:
            let current_values =
                state.active_values[state.last_active_value_id];
            current_values.push({
                first_candle_id: action.first_candle_id,
                last_candle_id: action.last_candle_id,
                values: action.values,
                from: action.from,
                to: action.to,
            });

            const new_active_values_data = Object.assign(
                {},
                state.active_values,
                {
                    [state.last_active_value_id]: current_values,
                }
            );
            return Object.assign({}, state, {
                active_values: new_active_values_data,
            });
        case types.ADD_ACTIVE_VOLUMES:
            let current_volumes =
                state.last_active_value_id in state.active_volumes
                    ? state.active_volumes[state.last_active_value_id]
                    : [];
            current_volumes.push({
                volumes: action.volumes,
            });

            const new_active_volumes = Object.assign({}, state.active_volumes, {
                [state.last_active_value_id]: current_volumes,
            });
            return Object.assign({}, state, {
                active_volumes: new_active_volumes,
            });
        case types.ADD_ACTIVE_VALUE_DATA:
            if (action.active_id in state.active_values) {
                let current_values = state.active_values[action.active_id];
                current_values[0].values += action.value;

                const new_active_values_data_ = Object.assign(
                    {},
                    state.active_values,
                    {
                        [action.active_id]: current_values,
                    }
                );
                return Object.assign({}, state, {
                    active_values: new_active_values_data_,
                });
            }
            return state;
        case types.SET_PATTERN:
            let n_pattern = action.pattern;
            if (
                n_pattern.length >
                params.item_pattern_length * state.pattern_length
            ) {
                n_pattern = n_pattern.substr(
                    n_pattern.length -
                        params.item_pattern_length * state.pattern_length,
                    params.item_pattern_length * state.pattern_length
                );
            }
            const new__actives = Object.assign({}, state.actives, {
                [action.active_id]: {
                    first_candle_id: null,
                    last_candle_id: null,
                    pattern: n_pattern,
                    current_operation: getCurrentOperation(
                        n_pattern,
                        action.active_id
                    ),
                },
            });
            return Object.assign({}, state, {
                actives: new__actives,
                last_active_id: null,
            });
        case types.SET_PATTERN_ANALYSIS:
            return Object.assign({}, state, {
                pattern_analysis: action.pattern_analysis,
            });
        case types.ADD_VALUE_TO_PATTERN:
            const active = state.actives[action.active_id];
            let current_pattern = active.pattern;
            let new_pattern = current_pattern + action.value;
            // El tamaño del nuevo patron es superior al tamaño definido del patron
            if (
                new_pattern.length >
                action.value.length * state.pattern_length
            ) {
                new_pattern = new_pattern.substr(
                    new_pattern.length -
                        action.value.length * state.pattern_length,
                    action.value.length * state.pattern_length
                );
            }

            const n_actives = Object.assign({}, state.actives, {
                [action.active_id]: {
                    first_candle_id: null,
                    last_candle_id: null,
                    pattern: new_pattern,
                    current_operation: getCurrentOperation(
                        new_pattern,
                        action.active_id
                    ),
                },
            });
            return Object.assign({}, state, {
                actives: n_actives,
            });
        case types.SET_TRADERS_MOOD:
            const new_traders_mood = Object.assign({}, state.traders_mood, {
                [action.active_id]: action.value,
            });
            return Object.assign({}, state, {
                traders_mood: new_traders_mood,
            });
        default:
            return state;
    }
};

export default reducer;
