import params from "../../../config/params";
import types from "./types";

const initState = {
    ws: null,
    time: null,
    ssid: null,
    profile: null,
    demo_balance_id: null,
    real_balance_id: null,
    connection_state: params.connectionStates.disconnected,
    turbo_actives: {},
    binary_actives: {},
};

const reducer = (state = initState, action) => {
    switch (action.type) {
        case types.SET_WS:
            return Object.assign({}, state, { ws: action.ws });
        case types.SET_TIME:
            return Object.assign({}, state, { time: action.time });
        case types.SET_SSID:
            return Object.assign({}, state, { ssid: action.ssid });
        case types.SET_PROFILE:
            return Object.assign({}, state, { profile: action.profile });
        case types.SET_DEMO_BALANCE_ID:
            return Object.assign({}, state, {
                demo_balance_id: action.balance_id,
            });
        case types.SET_REAL_BALANCE_ID:
            return Object.assign({}, state, {
                real_balance_id: action.balance_id,
            });
        case types.SET_CONNECTION_STATE:
            return Object.assign({}, state, {
                connection_state: action.connection_state,
            });
        case types.SET_TURBO_ACTIVES:
            return Object.assign({}, state, {
                turbo_actives: action.actives,
            });
        case types.SET_BINARY_ACTIVES:
            return Object.assign({}, state, {
                binary_actives: action.actives,
            });
        case types.SET_COMMISSION_VALUE:
            if (
                action.active_id in state.turbo_actives &&
                action.instrument_type === "turbo-option"
            ) {
                let active_data = Object.assign(
                    {},
                    state.turbo_actives[action.active_id],
                    {
                        option: {
                            profit: {
                                commission: action.commission,
                            },
                        },
                    }
                );

                const new_turbo_actives = Object.assign(
                    {},
                    state.turbo_actives,
                    {
                        [action.active_id]: active_data,
                    }
                );

                return Object.assign({}, state, {
                    turbo_actives: new_turbo_actives,
                });
            } else if (
                action.active_id in state.binary_actives &&
                action.instrument_type === "binary-option"
            ) {
                let active_data = Object.assign(
                    {},
                    state.binary_actives[action.active_id],
                    {
                        option: {
                            profit: {
                                commission: action.commission,
                            },
                        },
                    }
                );

                const new_binary_actives = Object.assign(
                    {},
                    state.binary_actives,
                    {
                        [action.active_id]: active_data,
                    }
                );

                return Object.assign({}, state, {
                    binary_actives: new_binary_actives,
                });
            }
            return state;
        default:
            return state;
    }
};

export default reducer;
