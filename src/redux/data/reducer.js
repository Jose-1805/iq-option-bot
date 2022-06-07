import params from "../../config/params";
import types from "./types";

const initState = {
    ws: null,
    ssid: null,
    profile: null,
    demo_balance_id: null,
    real_balance_id: null,
    connection_state: params.connectionStates.disconnected,
};

const reducer = (state = initState, action) => {
    switch (action.type) {
        case types.SET_WS:
            return Object.assign({}, state, { ws: action.ws });
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
        default:
            return initState;
    }
};

export default reducer;
