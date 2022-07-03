import { useDispatch } from "react-redux";
import types from "../redux/types";

const useIqOptionRedux = () => {
    const dispatch = useDispatch();

    /**
     * Asignación del ws de conexión al broker
     *
     * @param {WebSocket} ws
     */
    const setWs = (ws) => {
        dispatch({
            type: types.SET_WS,
            ws,
        });
    };

    /**
     * Asignación marca de tiempo sincronizada
     *
     * @param {WebSocket} ws
     */
    const setTime = (time) => {
        dispatch({
            type: types.SET_TIME,
            time,
        });
    };

    /**
     * Asignación del ssid del usuario
     *
     * @param {string} ssid
     */
    const setSsid = (ssid) => {
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
    const setProfile = (profile) => {
        const keys = Object.keys(profile.balances);

        for (let i = 0; i < keys.length; i++) {
            if (profile.balances[i].type === 4) {
                setDemoBalanceId(profile.balances[i].id);
            } else if (profile.balances[i].type === 1) {
                setRealBalanceId(profile.balances[i].id);
            }
        }
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
    const setDemoBalanceId = (balance_id) => {
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
    const setRealBalanceId = (balance_id) => {
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
    const setConnectionState = (connection_state) => {
        dispatch({
            type: types.SET_CONNECTION_STATE,
            connection_state,
        });
    };

    /**
     * Asignación activos para operaciones turbo
     *
     * @param {object} actives
     */
    const setTurboActives = (actives) => {
        dispatch({
            type: types.SET_TURBO_ACTIVES,
            actives,
        });
    };

    /**
     * Asignación activos para operaciones binarias
     *
     * @param {object} actives
     */
    const setBinaryActives = (actives) => {
        dispatch({
            type: types.SET_BINARY_ACTIVES,
            actives,
        });
    };

    /**
     *
     * @param {integer} active_id
     * @param {string} instrument_type
     * @param {integer} commission
     */
    const setCommissionValue = (active_id, instrument_type, commission) => {
        dispatch({
            type: types.SET_COMMISSION_VALUE,
            active_id,
            instrument_type,
            commission,
        });
    };

    return {
        setWs,
        setTime,
        setSsid,
        setProfile,
        setDemoBalanceId,
        setRealBalanceId,
        setConnectionState,
        setTurboActives,
        setBinaryActives,
        setCommissionValue,
    };
};

export default useIqOptionRedux;
