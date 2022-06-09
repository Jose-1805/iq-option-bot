import types from "./types";

const initState = {
    // Activo del que se obtiene el patrón para analizar
    active_id: null,
    // Primer identificador de vela registrado
    first_candle_id: null,
    // Último identificador de vela registrado
    last_candle_id: null,
    //Tamaño de la vela a analizar
    candle_size: 300,
    // Cantidad de velas analizadas en el patrón
    pattern_length: 7,
    // Valor del patrón actual en el activo analizado
    current_pattern: "",
    // Valores consultados de cada activo
    active_values: {},
};

const reducer = (state = initState, action) => {
    switch (action.type) {
        case types.SET_ACTIVE_ID:
            return Object.assign({}, state, {
                active_id: action.active_id,
                last_candle_id:
                    action.active_id !== state.active_id
                        ? null
                        : state.last_candle_id,
                first_candle_id:
                    action.active_id !== state.active_id
                        ? null
                        : state.first_candle_id,
                // SI el activo cambia se reinicia el patrón
                current_pattern:
                    action.active_id !== state.active_id
                        ? ""
                        : state.current_pattern,
            });
        case types.SET_LAST_CANDLE_ID:
            return Object.assign({}, state, {
                first_candle_id: action.first_candle_id
                    ? action.first_candle_id
                    : action.last_candle_id,
                last_candle_id: action.last_candle_id,
            });
        case types.SET_PATTERN:
            return Object.assign({}, state, {
                current_pattern: action.pattern,
            });
        case types.ADD_VALUE_TO_PATTERN:
            let new_pattern = state.current_pattern + action.value;
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
            return Object.assign({}, state, {
                current_pattern: new_pattern,
            });
        case types.SET_PATTERN_LENGTH:
            return Object.assign({}, state, {
                pattern_length: action.length,
                // Si el tamaño cambia se reinicia el patrón
                current_pattern:
                    action.length !== state.pattern_length
                        ? ""
                        : state.current_pattern,
            });
        case types.ADD_CANDLE_VALUE:
            const new_value =
                (action.active_id in state.active_values
                    ? state.active_values[action.active_id]
                    : "") +
                action.value +
                ",";

            return Object.assign({}, state, {
                active_values: Object.assign({}, state.active_values, {
                    [action.active_id]: new_value,
                }),
            });
        default:
            return state;
    }
};

export default reducer;
