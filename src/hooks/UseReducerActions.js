import { useDispatch } from "react-redux";
import types from "../redux/data/types";

const useReducerActions = () => {
    const dispatch = useDispatch();

    /**
     * Asignación del ws de conexión al broker
     *
     * @param {WebSocket} ws
     */
    const actSetWs = (ws) => {
        dispatch({
            type: types.SET_WS,
            ws,
        });
    };

    /**
     * Asignación del ssid del usuario
     *
     * @param {string} ssid
     */
    const actSetSsid = (ssid) => {
        dispatch({
            type: types.SET_SSID,
            ssid,
        });
    };

    /**
     * Asignación de perfil de IqOption del usuario
     *
     * @param {object} profile
     */
    const actSetProfile = (profile) => {
        dispatch({
            type: types.SET_PROFILE,
            profile,
        });
    };

    /**
     * Asignación de identificador de cuenta de prueba
     *
     * @param {object} balance_id
     */
    const actSetDemoBalanceId = (balance_id) => {
        dispatch({
            type: types.SET_DEMO_BALANCE_ID,
            balance_id,
        });
    };

    /**
     * Asignación de identificador de cuenta de real
     *
     * @param {object} balance_id
     */
    const actSetRealBalanceId = (balance_id) => {
        dispatch({
            type: types.SET_REAL_BALANCE_ID,
            balance_id,
        });
    };

    /**
     * Asignación de estado de la conexión del usuario
     *
     * @param {integer} connection_state
     */
    const actSetConnectionState = (connection_state) => {
        dispatch({
            type: types.SET_CONNECTION_STATE,
            connection_state,
        });
    };

    return {
        actSetWs,
        actSetSsid,
        actSetProfile,
        actSetDemoBalanceId,
        actSetRealBalanceId,
        actSetConnectionState,
    };
};

export default useReducerActions;
